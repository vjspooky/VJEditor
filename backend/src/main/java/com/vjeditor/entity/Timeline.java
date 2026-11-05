package com.vjeditor.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Timeline {
    private String id;
    private String projectId;
    private double duration;
    private List<TimelineTrack> tracks = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public Timeline() {
    }

    public Timeline(String id, String projectId, double duration, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.duration = duration;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public List<TimelineTrack> getTracks() {
        return tracks;
    }

    public void setTracks(List<TimelineTrack> tracks) {
        this.tracks = tracks;
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
