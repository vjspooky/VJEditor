package com.vjeditor.controller;

import com.vjeditor.dto.TimelineRequest;
import com.vjeditor.entity.Timeline;
import com.vjeditor.service.TimelineService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/timelines")
public class TimelineController {
    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping("/project/{projectId}")
    public Timeline getTimelineByProject(@PathVariable String projectId) {
        return timelineService.getByProjectId(projectId);
    }

    @PutMapping
    public Timeline saveTimeline(@Valid @RequestBody TimelineRequest request) {
        return timelineService.saveTimeline(request);
    }
}
