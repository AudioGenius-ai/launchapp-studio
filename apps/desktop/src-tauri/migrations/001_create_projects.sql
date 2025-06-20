CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    settings TEXT NOT NULL -- JSON string
);

CREATE INDEX idx_projects_path ON projects(path);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);