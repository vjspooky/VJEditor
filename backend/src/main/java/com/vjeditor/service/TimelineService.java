package com.vjeditor.service;

import com.vjeditor.dto.TimelineRequest;
import com.vjeditor.entity.Timeline;
import com.vjeditor.exception.ResourceNotFoundException;
import com.vjeditor.repository.TimelineRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class TimelineService {
    private final TimelineRepository timelineRepository;

    public TimelineService(TimelineRepository timelineRepository) {
        this.timelineRepository = timelineRepository;
    }

    public Timeline getByProjectId(String projectId) {
        return timelineRepository.findByProjectId(projectId)
                .orElseGet(() -> {
                    Timeline newTimeline = new Timeline(
                            UUID.randomUUID().toString(),
                            projectId,
                            0.0,
                            Instant.now(),
                            Instant.now()
                    );
                    return timelineRepository.save(newTimeline);
                });
    }

    public Timeline saveTimeline(TimelineRequest req) {
        Timeline timeline = timelineRepository.findByProjectId(req.getProjectId())
                .orElse(new Timeline(
                        UUID.randomUUID().toString(),
                        req.getProjectId(),
                        req.getDuration(),
                        Instant.now(),
                        Instant.now()
                ));

        timeline.setDuration(req.getDuration());
        timeline.setTracks(req.getTracks());
        timeline.setUpdatedAt(Instant.now());
        return timelineRepository.save(timeline);
    }
}
