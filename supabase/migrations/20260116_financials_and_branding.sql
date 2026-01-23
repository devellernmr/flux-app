-- Adiciona colunas para controle financeiro e white-label avançado
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expenses DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS agency_name TEXT,
ADD COLUMN IF NOT EXISTS custom_logo_url TEXT,
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';

-- Adiciona coluna de tipo nos comentários para suportar logs de atividade
ALTER TABLE project_comments 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'comment';
