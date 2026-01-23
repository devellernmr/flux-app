-- Add business intelligence columns to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_hourly_rate DECIMAL(10,2) DEFAULT 0;

-- Optional: Add a comment to explain the purpose
COMMENT ON COLUMN projects.estimated_hours IS 'Horas estimadas para execução do projeto';
COMMENT ON COLUMN projects.target_hourly_rate IS 'Quanto o usuário deseja ganhar por hora neste projeto';
