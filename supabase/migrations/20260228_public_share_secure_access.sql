-- Public Share Secure Access (2026-02-28)
--
-- CONTEXTO
-- As telas publicas de revisao (/feedback/:fileId, /share/design/:fileId), de
-- briefing (/share/:id) e de convite (/invite/:token) funcionam SEM autenticacao,
-- o que exigia politicas anonimas em `public.projects`, `files`, `comments`,
-- `project_comments`, `team_invites` e `briefings`.
--
-- PROBLEMA (auditoria de 2026-02-28, projeto wdybtosjzpexycvgreph)
-- Probes com a apikey anonima, sem sessao de usuario:
--   GET /rest/v1/projects?select=*&limit=1         -> 206 | 0-0/12 (12/12 linhas)
--   GET /rest/v1/files?select=*&limit=1            -> 206 | 0-0/2  (2/2 linhas)
--   GET /rest/v1/project_comments?select=*&limit=1 -> 200 | */1    (1/1 linha)
--   GET /rest/v1/team_invites?select=*&limit=1     -> 206 | 0-0/2  (2/2 linhas)
--
-- Qualquer visitante anonimo enumerava os projetos de todos os clientes (nome,
-- descricao, user_id do dono, orcamento) e os arquivos de todos os projetos.
-- O caso grave e `team_invites`: expoe `email` e `token`, e o `token` e a
-- credencial usada por /invite/:token para rodar `upsert` em `team_members` --
-- quem lesse a tabela entrava como `editor` no projeto de outra pessoa. O app
-- ainda so validava `accepted_at IS NULL`, nunca `expires_at`, entao convite
-- expirado continuava valido.
--
-- RLS nao enxerga o filtro enviado pelo PostgREST: "SELECT anonimo em X" e
-- sempre "SELECT anonimo em TODAS as linhas de X". Por isso a solucao sao
-- funcoes SECURITY DEFINER, que validam no servidor a credencial apresentada
-- na URL (id do arquivo, id do briefing ou token do convite).
--
-- ORDEM DE APLICACAO
--   1. Deploy do frontend (o client chama as RPCs primeiro e cai para as
--      queries diretas apenas se a funcao ainda nao existir no banco).
--   2. Esta migration.
--   Client novo + banco antigo => fallback.  Banco novo + client novo => RPCs.

-- ---------------------------------------------------------------------------
-- 0. Correcoes de schema
-- ---------------------------------------------------------------------------
-- `user_name` e usada por PublicFeedback.tsx para exibir o autor do comentario de
-- convidado; sem a coluna, todo insert anonimo falhava com 42703.
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS user_name text;

-- Convidados comentam sem login, entao user_id precisa aceitar NULL.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'comments'
           AND column_name = 'user_id' AND is_nullable = 'NO'
    ) THEN
        RAISE NOTICE '[public-share] comments.user_id NOT NULL -> liberado para NULL';
        EXECUTE 'alter table public.comments alter column user_id drop not null';
    END IF;
END $$;
-- ---------------------------------------------------------------------------
-- 0.1 Reparo do trigger de notificacao de upload
-- ---------------------------------------------------------------------------
-- supabase/migrations/file_upload_trigger.sql esta desatualizado: a funcao le
-- `projects.owner_id` (coluna renomeada para `user_id` em 2025/12) e grava em
-- `notifications.project_id` (que nao existe). Se esse trigger estiver
-- instalado, TODO insert em `files` falha -- inclusive o upload publico e a
-- RPC add_public_file. Recriamos a funcao com as colunas corretas; o trigger
-- em si e preservado. Se a funcao nao existir, nada acontece.
DO $$
DECLARE
    v_fn oid;
BEGIN
    SELECT p.oid INTO v_fn
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = 'handle_new_file_notification';

    IF v_fn IS NOT NULL THEN
        RAISE NOTICE '[fix] recriando public.handle_new_file_notification (owner_id -> user_id, sem notifications.project_id)';

        EXECUTE $inner$
            CREATE OR REPLACE FUNCTION public.handle_new_file_notification()
            RETURNS TRIGGER AS $body$
            DECLARE
                v_owner_id uuid;
                v_project_name text;
            BEGIN
                SELECT p.user_id, p.name
                  INTO v_owner_id, v_project_name
                  FROM public.projects p
                 WHERE p.id = NEW.project_id;

                -- Notifica o dono apenas quando o upload veio de fora
                -- (cliente/convidado): evita notificar quem ja esta na tela.
                IF v_owner_id IS NULL OR v_owner_id = auth.uid() THEN
                    RETURN NEW;
                END IF;

                INSERT INTO public.notifications (user_id, type, title, message, link)
                VALUES (
                    v_owner_id,
                    'file_upload',
                    'Novo arquivo recebido',
                    'Um novo arquivo foi adicionado ao projeto ' || v_project_name,
                    '/project/' || NEW.project_id
                );

                RETURN NEW;
            END;
            $body$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
        $inner$;
    END IF;
END $$;



-- ---------------------------------------------------------------------------
-- 1. Arquivo publico (revisao)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_file(p_file_id text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT jsonb_build_object(
        'id', f.id,
        'name', f.name,
        'url', f.url,
        'status', f.status,
        'project_id', f.project_id,
        'projects', CASE
            WHEN p.id IS NULL THEN NULL
            ELSE jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'custom_logo_url', p.custom_logo_url,
                'agency_name', p.agency_name
            )
        END
    )
    FROM public.files f
    LEFT JOIN public.projects p ON p.id = f.project_id
    WHERE f.id::text = p_file_id
    LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- 2. Comentarios publicos de um arquivo
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_file_comments(p_file_id text)
RETURNS SETOF public.comments
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT c.*
      FROM public.comments c
     WHERE c.file_id::text = p_file_id
     ORDER BY c.created_at ASC;
$$;

-- ---------------------------------------------------------------------------
-- 3. Briefing publico (src/pages/PublicBriefing.tsx)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_briefing(p_briefing_id text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT jsonb_build_object(
        'id', b.id,
        'content', b.content,
        'status', b.status,
        'projects', CASE
            WHEN p.id IS NULL THEN NULL
            ELSE jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'custom_logo_url', p.custom_logo_url,
                'agency_name', p.agency_name
            )
        END
    )
    FROM public.briefings b
    LEFT JOIN public.projects p ON p.id = b.project_id
    WHERE b.id::text = p_briefing_id
    LIMIT 1;
$$;

-- Resposta do cliente: so grava enquanto o briefing nao foi aprovado.
CREATE OR REPLACE FUNCTION public.submit_public_briefing(p_briefing_id text, p_content jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id public.briefings.id%TYPE;
    v_status text;
    v_row public.briefings;
BEGIN
    IF p_content IS NULL OR jsonb_typeof(p_content) <> 'array' THEN
        RAISE EXCEPTION 'invalid_content';
    END IF;

    IF jsonb_array_length(p_content) = 0 THEN
        RAISE EXCEPTION 'empty_content';
    END IF;

    SELECT b.id, b.status INTO v_id, v_status
      FROM public.briefings b
     WHERE b.id::text = p_briefing_id;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'briefing_not_found';
    END IF;

    IF v_status = 'approved' THEN
        RAISE EXCEPTION 'briefing_already_approved';
    END IF;

    UPDATE public.briefings
       SET content = p_content,
           status = 'sent'
     WHERE id = v_id
    RETURNING * INTO v_row;

    RETURN to_jsonb(v_row);
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Convite por token (src/pages/invite/[token].tsx)
-- ---------------------------------------------------------------------------
-- Leitura: devolve o minimo para a tela. Nao devolve `email` nem o proprio
-- `token`, que antes ficavam expostos na tabela para qualquer visitante.
CREATE OR REPLACE FUNCTION public.get_invite_by_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite record;
BEGIN
    SELECT ti.id, ti.project_id, ti.role,
           p.name, p.agency_name, p.custom_logo_url
      INTO v_invite
      FROM public.team_invites ti
      LEFT JOIN public.projects p ON p.id = ti.project_id
     WHERE ti.token::text = p_token
       AND ti.accepted_at IS NULL
       AND (ti.expires_at IS NULL OR ti.expires_at > now());

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN jsonb_build_object(
        'id', v_invite.id,
        'project_id', v_invite.project_id,
        'role', v_invite.role,
        'projects', jsonb_build_object(
            'name', v_invite.name,
            'agency_name', v_invite.agency_name,
            'custom_logo_url', v_invite.custom_logo_url
        )
    );
END;
$$;

-- Aceite: valida expiracao (antes so checava `accepted_at IS NULL`), garante o
-- vinculo em team_members e consome o convite.
CREATE OR REPLACE FUNCTION public.accept_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite public.team_invites%ROWTYPE;
    v_uid uuid := auth.uid();
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    SELECT * INTO v_invite
      FROM public.team_invites
     WHERE token::text = p_token
       AND accepted_at IS NULL
       AND (expires_at IS NULL OR expires_at > now());

    IF NOT FOUND THEN
        RAISE EXCEPTION 'invite_invalid_or_expired';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.team_members m
         WHERE m.project_id = v_invite.project_id
           AND m.user_id = v_uid
    ) THEN
        UPDATE public.team_members
           SET role = COALESCE(v_invite.role, role)
         WHERE project_id = v_invite.project_id
           AND user_id = v_uid;
    ELSE
        INSERT INTO public.team_members (project_id, user_id, role)
        VALUES (v_invite.project_id, v_uid, COALESCE(v_invite.role, 'editor'));
    END IF;

    UPDATE public.team_invites
       SET accepted_at = now()
     WHERE id = v_invite.id;

    RETURN jsonb_build_object('project_id', v_invite.project_id);
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. Comentario de convidado e status do arquivo
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_public_comment(
    p_file_id text,
    p_content text,
    p_position_x numeric,
    p_position_y numeric,
    p_user_name text,
    p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_file_id public.files.id%TYPE;
    v_author uuid;
    v_row public.comments;
BEGIN
    IF p_content IS NULL OR length(btrim(p_content)) = 0 THEN
        RAISE EXCEPTION 'comment_content_required';
    END IF;

    SELECT f.id INTO v_file_id
      FROM public.files f
     WHERE f.id::text = p_file_id;

    IF v_file_id IS NULL THEN
        RAISE EXCEPTION 'file_not_found';
    END IF;

    -- Só aceita o autor se for o proprio usuario autenticado (anti-spoofing);
    -- visitante anonimo fica com user_id nulo (convidado).
    v_author := CASE
        WHEN p_user_id IS NOT NULL AND p_user_id = auth.uid() THEN p_user_id
        ELSE NULL
    END;

    INSERT INTO public.comments (file_id, position_x, position_y, content, user_name, user_id)
    VALUES (
        v_file_id,
        p_position_x,
        p_position_y,
        p_content,
        NULLIF(btrim(p_user_name), ''),
        v_author
    )
    RETURNING * INTO v_row;

    RETURN to_jsonb(v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_public_file_status(p_file_id text, p_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_status IS NULL OR p_status NOT IN ('pending', 'approved', 'rejected') THEN
        RAISE EXCEPTION 'invalid_status';
    END IF;

    UPDATE public.files
       SET status = p_status
     WHERE id::text = p_file_id;

    RETURN FOUND;
END;
$$;

-- Atalho usado por PublicFeedback.tsx ao aprovar o arquivo.
CREATE OR REPLACE FUNCTION public.approve_public_file(p_file_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.set_public_file_status(p_file_id, 'approved');
END;
$$;

-- ---------------------------------------------------------------------------
-- Registro de arquivo enviado pelo cliente no briefing publico
-- (src/components/BriefingFileUploader.tsx faz o insert em `files` com a
-- anon key; sem esta RPC o recurso quebra quando o acesso anonimo e fechado).
CREATE OR REPLACE FUNCTION public.add_public_file(
    p_project_id text,
    p_name text,
    p_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_project_id public.projects.id%TYPE;
    v_row public.files;
BEGIN
    SELECT p.id INTO v_project_id
      FROM public.projects p
     WHERE p.id::text = p_project_id;

    IF v_project_id IS NULL THEN
        RAISE EXCEPTION 'project_not_found';
    END IF;

    IF p_name IS NULL OR length(btrim(p_name)) = 0 THEN
        RAISE EXCEPTION 'invalid_file_name';
    END IF;

    -- Só aceita URL pública de storage (bloqueia link arbitrário).
    IF p_url IS NULL OR p_url !~ '^https://[^/]+/storage/v1/object/' THEN
        RAISE EXCEPTION 'invalid_file_url';
    END IF;

    INSERT INTO public.files (project_id, name, url, status)
    VALUES (v_project_id, btrim(p_name), p_url, 'pending')
    RETURNING * INTO v_row;

    RETURN to_jsonb(v_row);
END;
$$;


-- 6. Permissoes: apenas EXECUTE, nunca acesso direto as tabelas
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_public_file(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_file_comments(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_briefing(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_public_briefing(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_invite_by_token(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_invite(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_public_comment(text, text, numeric, numeric, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_public_file_status(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_public_file(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_public_file(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_public_file(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_file_comments(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_briefing(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_public_briefing(text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_public_comment(text, text, numeric, numeric, text, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_public_file_status(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.approve_public_file(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_public_file(text, text, text) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 7. Fecha o acesso anonimo direto as tabelas
-- ---------------------------------------------------------------------------
-- Remove SOMENTE politicas que liberam o papel `anon` ou que usam
-- USING (true) / WITH CHECK (true) nas tabelas expostas. As politicas de dono
-- e de equipe (auth.uid() = user_id, membership, etc.) permanecem intactas,
-- portanto o app autenticado segue funcionando. Cada remocao vira um NOTICE.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname, roles, qual, with_check
          FROM pg_policies
         WHERE schemaname = 'public'
           AND tablename IN ('projects', 'files', 'comments',
                             'project_comments', 'team_invites', 'briefings')
           AND (
                 'anon'::name = ANY (roles)
                 OR coalesce(qual, '') = 'true'
                 OR coalesce(with_check, '') = 'true'
               )
    LOOP
        RAISE NOTICE '[public-share] removendo politica % em %.% (roles=%, using=%, check=%)',
            pol.policyname, pol.schemaname, pol.tablename, pol.roles, pol.qual, pol.with_check;

        EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 8. Verificacao pos-migration
-- ---------------------------------------------------------------------------
-- Com a apikey anonima, estas duas queries devem devolver [] (Content-Range */0):
--   GET /rest/v1/projects?select=id&limit=1
--   GET /rest/v1/files?select=id&limit=1
-- E estas RPCs devem responder:
--   POST /rest/v1/rpc/get_public_file        {"p_file_id":"9"}
--   POST /rest/v1/rpc/get_public_briefing    {"p_briefing_id":"1"}
--   POST /rest/v1/rpc/get_invite_by_token    {"p_token":"<token valido>"}
