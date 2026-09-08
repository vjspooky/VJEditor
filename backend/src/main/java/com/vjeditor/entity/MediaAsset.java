package com.vjeditor.entity;

import java.time.Instant;

public class MediaAsset {
    private String id;
    private String projectId;
    private String name;
    private String type;
    private String url;
    private String thumbnail;
    private Double duration;
    private Integer width;
    private Integer height;
    private long size;
    private Instant createdAt;

    public MediaAsset() {
    }

    public MediaAsset(String id, String projectId, String name, String type, String url, String thumbnail, Double duration, Integer width, Integer height, long size, Instant createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.type = type;
        this.url = url;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.width = width;
        this.height = height;
        this.size = size;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
