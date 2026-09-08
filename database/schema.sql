-- VJEditor Consolidated Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(500),
    duration NUMERIC(10, 3) NOT NULL DEFAULT 0.0,
    aspect_ratio VARCHAR(10) NOT NULL DEFAULT '16:9',
    resolution VARCHAR(10) NOT NULL DEFAULT '1080p',
    type VARCHAR(20) NOT NULL DEFAULT 'blank',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS timelines (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    duration NUMERIC(10, 3) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_tracks (
    id VARCHAR(36) PRIMARY KEY,
    timeline_id VARCHAR(36) NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    track_order INTEGER NOT NULL DEFAULT 0,
    muted BOOLEAN NOT NULL DEFAULT FALSE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    visible BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS timeline_clips (
    id VARCHAR(36) PRIMARY KEY,
    track_id VARCHAR(36) NOT NULL REFERENCES timeline_tracks(id) ON DELETE CASCADE,
    media_id VARCHAR(36) REFERENCES media_assets(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    start_time NUMERIC(10, 3) NOT NULL DEFAULT 0.0,
    duration NUMERIC(10, 3) NOT NULL,
    source_start_time NUMERIC(10, 3) NOT NULL DEFAULT 0.0,
    source_duration NUMERIC(10, 3) NOT NULL,
    volume NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    muted BOOLEAN NOT NULL DEFAULT FALSE,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    locked BOOLEAN NOT NULL DEFAULT FALSE
);

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

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_media_project_id ON media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_tracks_timeline ON timeline_tracks(timeline_id);
CREATE INDEX IF NOT EXISTS idx_clips_track ON timeline_clips(track_id);
CREATE INDEX IF NOT EXISTS idx_exports_project ON export_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON export_jobs(status);
