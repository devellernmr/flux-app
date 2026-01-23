-- FLUXO APP - DATABASE RECOVERY SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Renomeia a coluna para o padrão esperado pelo código (FIX: Erros 400)
ALTER TABLE projects RENAME COLUMN owner_id TO user_id;

-- 2. Adiciona colunas para as novas funções
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expenses DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agency_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS custom_logo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]';

-- 3. Atualiza Políticas de Segurança (RLS)
DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
CREATE POLICY "Users can manage their own projects" ON projects
FOR ALL USING (auth.uid() = user_id);

-- 4. Garante RLS Ativo
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
