package com.vjeditor.dto;

import com.vjeditor.entity.Project;
import java.time.Instant;

public class ProjectResponse {
    private String id;
    private String name;
    private String thumbnail;
    private double duration;
    private String aspectRatio;
    private String resolution;
    private String type;
    private Instant createdAt;
    private Instant updatedAt;

    public ProjectResponse() {
    }

    public static ProjectResponse from(Project project) {
        ProjectResponse resp = new ProjectResponse();
        resp.id = project.getId();
        resp.name = project.getName();
        resp.thumbnail = project.getThumbnail();
        resp.duration = project.getDuration();
        resp.aspectRatio = project.getAspectRatio();
        resp.resolution = project.getResolution();
        resp.type = project.getType();
        resp.createdAt = project.getCreatedAt();
        resp.updatedAt = project.getUpdatedAt();
        return resp;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public double getDuration() {
        return duration;
    }

    public String getAspectRatio() {
        return aspectRatio;
    }

    public String getResolution() {
        return resolution;
    }

    public String getType() {
        return type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
