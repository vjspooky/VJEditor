-- V3: Create Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    thumbnail VARCHAR(1000),
    duration NUMERIC(10, 3),
    width INTEGER,
    height INTEGER,
    size BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_project_id ON media_assets(project_id);
