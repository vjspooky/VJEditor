package com.vjeditor.entity;

import java.time.Instant;

public class ExportJob {
    private String id;
    private String projectId;
    private String format;
    private String resolution;
    private int fps;
    private String quality;
    private String status;
    private double progress;
    private String outputUrl;
    private String errorMessage;
    private Instant createdAt;
    private Instant completedAt;

    public ExportJob() {
    }

    public ExportJob(String id, String projectId, String format, String resolution, int fps, String quality, String status, double progress, String outputUrl, String errorMessage, Instant createdAt, Instant completedAt) {
        this.id = id;
        this.projectId = projectId;
        this.format = format;
        this.resolution = resolution;
        this.fps = fps;
        this.quality = quality;
        this.status = status;
        this.progress = progress;
        this.outputUrl = outputUrl;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
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

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public int getFps() {
        return fps;
    }

    public void setFps(int fps) {
        this.fps = fps;
    }

    public String getQuality() {
        return quality;
    }

    public void setQuality(String quality) {
        this.quality = quality;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public String getOutputUrl() {
        return outputUrl;
    }

    public void setOutputUrl(String outputUrl) {
        this.outputUrl = outputUrl;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
