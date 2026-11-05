CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    aspect_ratio VARCHAR(16) NOT NULL,
    thumbnail_color VARCHAR(16) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(32) NOT NULL,
    prompt VARCHAR(4000),
    language VARCHAR(64),
    voice VARCHAR(64),
    style VARCHAR(128)
);