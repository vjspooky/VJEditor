package com.vjeditor.entity;

public class TimelineClip {
    private String id;
    private String trackId;
    private String mediaId;
    private String name;
    private String type;
    private double startTime;
    private double duration;
    private double sourceStartTime;
    private double sourceDuration;
    private double volume = 1.0;
    private boolean muted;
    private boolean visible = true;
    private boolean locked;

    public TimelineClip() {
    }

    public TimelineClip(String id, String trackId, String mediaId, String name, String type, double startTime, double duration, double sourceStartTime, double sourceDuration, double volume, boolean muted, boolean visible, boolean locked) {
        this.id = id;
        this.trackId = trackId;
        this.mediaId = mediaId;
        this.name = name;
        this.type = type;
        this.startTime = startTime;
        this.duration = duration;
        this.sourceStartTime = sourceStartTime;
        this.sourceDuration = sourceDuration;
        this.volume = volume;
        this.muted = muted;
        this.visible = visible;
        this.locked = locked;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTrackId() {
        return trackId;
    }

    public void setTrackId(String trackId) {
        this.trackId = trackId;
    }

    public String getMediaId() {
        return mediaId;
    }

    public void setMediaId(String mediaId) {
        this.mediaId = mediaId;
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

    public double getStartTime() {
        return startTime;
    }

    public void setStartTime(double startTime) {
        this.startTime = startTime;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public double getSourceStartTime() {
        return sourceStartTime;
    }

    public void setSourceStartTime(double sourceStartTime) {
        this.sourceStartTime = sourceStartTime;
    }

    public double getSourceDuration() {
        return sourceDuration;
    }

    public void setSourceDuration(double sourceDuration) {
        this.sourceDuration = sourceDuration;
    }

    public double getVolume() {
        return volume;
    }

    public void setVolume(double volume) {
        this.volume = volume;
    }

    public boolean isMuted() {
        return muted;
    }

    public void setMuted(boolean muted) {
        this.muted = muted;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }
}
