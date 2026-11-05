package com.vjeditor.project;

import org.springframework.http.HttpStatus;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {
    private final JdbcTemplate jdbc;

    public ProjectService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Project> list() {
        return jdbc.query("SELECT * FROM projects ORDER BY updated_at DESC", this::mapProject);
    }

    public Project get(String id) {
        try {
            return jdbc.queryForObject(
                    "SELECT * FROM projects WHERE id = ?",
                    this::mapProject,
                    id
            );
        } catch (EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }
    }

    public Project create(ProjectRequest request) {
        Instant now = Instant.now();
        String id = UUID.randomUUID().toString();
        Project project = new Project(
                id,
                request.name(),
                request.duration(),
                request.aspectRatio(),
                colorForSource(request.source()),
                now,
                now,
                request.source(),
                request.prompt(),
                request.language(),
                request.voice(),
                request.style()
        );
        jdbc.update(
            "INSERT INTO projects (id, name, duration, aspect_ratio, thumbnail_color, created_at, updated_at, source, prompt, language, voice, style) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            project.id(), project.name(), project.duration(), project.aspectRatio(), project.thumbnailColor(),
            project.createdAt(), project.updatedAt(), project.source(), project.prompt(), project.language(),
            project.voice(), project.style()
        );
        return project;
    }

    public Project update(String id, ProjectRequest request) {
        Project current = get(id);
        Project updated = new Project(
                current.id(),
                request.name(),
                request.duration(),
                request.aspectRatio(),
                current.thumbnailColor(),
                current.createdAt(),
                Instant.now(),
                request.source(),
                request.prompt(),
                request.language(),
                request.voice(),
                request.style()
        );
        jdbc.update(
                "UPDATE projects SET name = ?, duration = ?, aspect_ratio = ?, updated_at = ?, source = ?, prompt = ?, language = ?, voice = ?, style = ? WHERE id = ?",
                updated.name(), updated.duration(), updated.aspectRatio(), updated.updatedAt(), updated.source(),
                updated.prompt(), updated.language(), updated.voice(), updated.style(), id
        );
        return updated;
    }

    public void delete(String id) {
        if (jdbc.update("DELETE FROM projects WHERE id = ?", id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }
    }

    private Project mapProject(java.sql.ResultSet result, int rowNumber) throws java.sql.SQLException {
        return new Project(
                result.getString("id"),
                result.getString("name"),
                result.getInt("duration"),
                result.getString("aspect_ratio"),
                result.getString("thumbnail_color"),
                result.getTimestamp("created_at").toInstant(),
                result.getTimestamp("updated_at").toInstant(),
                result.getString("source"),
                result.getString("prompt"),
                result.getString("language"),
                result.getString("voice"),
                result.getString("style")
        );
    }

    private String colorForSource(String source) {
        return switch (source) {
            case "ai" -> "#1f4a3c";
            case "import" -> "#1e3a5f";
            case "template" -> "#3a2a4a";
            default -> "#2a2d38";
        };
    }
}
