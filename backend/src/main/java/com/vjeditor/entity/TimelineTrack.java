package com.vjeditor.entity;

import java.util.ArrayList;
import java.util.List;

public class TimelineTrack {
    private String id;
    private String timelineId;
    private String name;
    private String type;
    private int trackOrder;
    private boolean muted;
    private boolean locked;
    private boolean visible;
    private List<TimelineClip> clips = new ArrayList<>();

    public TimelineTrack() {
    }

    public TimelineTrack(String id, String timelineId, String name, String type, int trackOrder, boolean muted, boolean locked, boolean visible) {
        this.id = id;
        this.timelineId = timelineId;
        this.name = name;
        this.type = type;
        this.trackOrder = trackOrder;
        this.muted = muted;
        this.locked = locked;
        this.visible = visible;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTimelineId() {
        return timelineId;
    }

    public void setTimelineId(String timelineId) {
        this.timelineId = timelineId;
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

    public int getTrackOrder() {
        return trackOrder;
    }

    public void setTrackOrder(int trackOrder) {
        this.trackOrder = trackOrder;
    }

    public boolean isMuted() {
        return muted;
    }

    public void setMuted(boolean muted) {
        this.muted = muted;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public List<TimelineClip> getClips() {
        return clips;
    }

    public void setClips(List<TimelineClip> clips) {
        this.clips = clips;
    }
}
