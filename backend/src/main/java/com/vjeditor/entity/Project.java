package com.vjeditor.entity;

import java.time.Instant;

public class Project {
    private String id;
    private String userId;
    private String name;
    private String thumbnail;
    private double duration;
    private String aspectRatio;
    private String resolution;
    private String type;
    private Instant createdAt;
    private Instant updatedAt;

    public Project() {
    }

    public Project(String id, String userId, String name, String thumbnail, double duration, String aspectRatio, String resolution, String type, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.aspectRatio = aspectRatio;
        this.resolution = resolution;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public String getAspectRatio() {
        return aspectRatio;
    }

    public void setAspectRatio(String aspectRatio) {
        this.aspectRatio = aspectRatio;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
