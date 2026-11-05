package com.vjeditor.controller;

import com.vjeditor.dto.MediaRequest;
import com.vjeditor.entity.MediaAsset;
import com.vjeditor.service.MediaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    public List<MediaAsset> getMedia(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return mediaService.getByProject(projectId);
        }
        return List.of();
    }

    @GetMapping("/{id}")
    public MediaAsset getMediaById(@PathVariable String id) {
        return mediaService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAsset createMedia(@Valid @RequestBody MediaRequest request) {
        return mediaService.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMedia(@PathVariable String id) {
        mediaService.delete(id);
    }
}
