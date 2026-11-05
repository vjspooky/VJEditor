package com.vjeditor.dto;

import com.vjeditor.entity.TimelineTrack;
import java.util.ArrayList;
import java.util.List;

public class TimelineRequest {
    private String projectId;
    private double duration;
    private List<TimelineTrack> tracks = new ArrayList<>();

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
}
