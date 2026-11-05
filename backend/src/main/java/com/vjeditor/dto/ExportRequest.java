package com.vjeditor.dto;

import jakarta.validation.constraints.NotBlank;

public class ExportRequest {
    @NotBlank(message = "Project ID is required")
    private String projectId;

    private String format = "mp4";
    private String resolution = "1080p";
    private int fps = 30;
    private String quality = "standard";

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
}
