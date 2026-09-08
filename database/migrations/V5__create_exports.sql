-- V5: Create Export Jobs Table
CREATE TABLE IF NOT EXISTS export_jobs (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    format VARCHAR(10) NOT NULL DEFAULT 'mp4',
    resolution VARCHAR(10) NOT NULL DEFAULT '1080p',
    fps INTEGER NOT NULL DEFAULT 30,
    quality VARCHAR(20) NOT NULL DEFAULT 'standard',
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    progress NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    output_url VARCHAR(1000),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_exports_project ON export_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON export_jobs(status);
