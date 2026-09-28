-- Storage Hardening (2026-02-27)
--
-- Objetivo: garantir de forma IDEMPOTENTE que os buckets usados pela aplicação
-- existam e que as políticas de acesso ao storage.objects estejam presentes.
-- Esta migration é apenas ADITIVA: nenhum bucket/objeto é removido ou
-- sobrescrito, e as políticas só são criadas quando ainda não existem.
--
-- Buckets usados pela aplicação:
--   * project-files  -> src/pages/ProjectFiles.tsx (upload autenticado)
--                    -> src/components/BriefingFileUploader.tsx (upload via
--                       link público de briefing, `PublicBriefing.tsx`)
--   * project-assets -> src/components/project/SettingsModal.tsx
--                       (logo da agência em `project-logos/`)
--
-- Ambos precisam ser PÚBLICOS porque o app usa `getPublicUrl()` para os links
-- de revisão/compartilhamento com o cliente (`/share/design/:fileId` e
-- `/feedback/:fileId`), que são acessados sem autenticação.
--
-- Verificação ao vivo (2026-02-27, projeto wdybtosjzpexycvgreph):
--   curl -s -i "https://wdybtosjzpexycvgreph.supabase.co/storage/v1/object/public/project-files/__probe__/missing.png"
--   curl -s -i "https://wdybtosjzpexycvgreph.supabase.co/storage/v1/object/public/project-assets/__probe__/missing.png"
--   -> HTTP 400 {"statusCode":"404","message":"Object not found","code":"NoSuchKey"}
--   (resposta "Object not found" e não "Bucket not found" => os dois buckets
--    existem e são públicos; o binário abaixo apenas torna isso reproduzível.)

-- ---------------------------------------------------------------------------
-- 1. Buckets (criação apenas se ausentes)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('project-files', 'project-files', true, 52428800, NULL), -- até 50MB, qualquer tipo
    ('project-assets', 'project-assets', true, 5242880, ARRAY[
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/svg+xml',
        'image/x-icon'
    ]) -- até 5MB, apenas imagens (logo da agência)
ON CONFLICT (id) DO NOTHING;

-- Aviso (não falha o push) quando um bucket existente não está público: sem
-- isso os links gerados por getPublicUrl() deixam de funcionar para clientes.
DO $$
DECLARE
    b record;
BEGIN
    FOR b IN
        SELECT id, public FROM storage.buckets
        WHERE id IN ('project-files', 'project-assets')
    LOOP
        IF NOT b.public THEN
            RAISE WARNING '[storage] bucket % não está público: links de compartilhamento falharão', b.id;
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Helper para validar a pasta do upload (project_id)
-- ---------------------------------------------------------------------------
-- O caminho usado pelo app é `<project_id>/<timestamp>_<arquivo>` e o upload
-- pode vir de um cliente anônimo (link público de briefing). A função valida
-- apenas que a pasta corresponde a um projeto existente, sem expor dados.
CREATE OR REPLACE FUNCTION public.is_valid_project_folder(folder text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT folder IS NOT NULL
       AND folder ~ '^[0-9]+$'
       AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id::text = folder);
$$;

REVOKE ALL ON FUNCTION public.is_valid_project_folder(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_valid_project_folder(text)
    TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Políticas de storage.objects (criação apenas se ausentes)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    -- 3.1 Leitura pública (necessária para share/feedback links e briefings)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'Public read project-files'
    ) THEN
        CREATE POLICY "Public read project-files" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id = 'project-files');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'Public read project-assets'
    ) THEN
        CREATE POLICY "Public read project-assets" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id = 'project-assets');
    END IF;

    -- 3.2 Upload em project-files: usuário logado ou cliente anônimo do
    --     briefing público, sempre dentro da pasta de um projeto existente.
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'Upload project-files by project folder'
    ) THEN
        CREATE POLICY "Upload project-files by project folder" ON storage.objects
            FOR INSERT TO anon, authenticated
            WITH CHECK (
                bucket_id = 'project-files'
                AND public.is_valid_project_folder((storage.foldername(name))[1])
            );
    END IF;

    -- 3.3 Upload de logo (project-assets) restrito à pasta project-logos/
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'Upload project-assets logos'
    ) THEN
        CREATE POLICY "Upload project-assets logos" ON storage.objects
            FOR INSERT TO authenticated
            WITH CHECK (
                bucket_id = 'project-assets'
                AND (storage.foldername(name))[1] = 'project-logos'
            );
    END IF;
END $$;
