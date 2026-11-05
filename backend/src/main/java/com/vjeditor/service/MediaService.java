package com.vjeditor.service;

import com.vjeditor.dto.MediaRequest;
import com.vjeditor.entity.MediaAsset;
import com.vjeditor.exception.ResourceNotFoundException;
import com.vjeditor.repository.MediaRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MediaService {
    private final MediaRepository mediaRepository;

    public MediaService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    public List<MediaAsset> getByProject(String projectId) {
        return mediaRepository.findByProjectId(projectId);
    }

    public MediaAsset getById(String id) {
        return mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media asset not found: " + id));
    }

    public MediaAsset create(MediaRequest req) {
        MediaAsset asset = new MediaAsset(
                UUID.randomUUID().toString(),
                req.getProjectId(),
                req.getName(),
                req.getType(),
                req.getUrl(),
                req.getThumbnail(),
                req.getDuration(),
                req.getWidth(),
                req.getHeight(),
                req.getSize(),
                Instant.now()
        );
        return mediaRepository.save(asset);
    }

    public void delete(String id) {
        if (!mediaRepository.deleteById(id)) {
            throw new ResourceNotFoundException("Media asset not found: " + id);
        }
    }
}
