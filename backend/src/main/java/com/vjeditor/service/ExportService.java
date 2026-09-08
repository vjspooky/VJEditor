package com.vjeditor.service;

import com.vjeditor.dto.ExportRequest;
import com.vjeditor.entity.ExportJob;
import com.vjeditor.exception.ResourceNotFoundException;
import com.vjeditor.repository.ExportJobRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ExportService {
    private final ExportJobRepository exportJobRepository;

    public ExportService(ExportJobRepository exportJobRepository) {
        this.exportJobRepository = exportJobRepository;
    }

    public List<ExportJob> getByProject(String projectId) {
        return exportJobRepository.findByProjectId(projectId);
    }

    public ExportJob getById(String id) {
        return exportJobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Export job not found: " + id));
    }

    public ExportJob createJob(ExportRequest req) {
        ExportJob job = new ExportJob(
                UUID.randomUUID().toString(),
                req.getProjectId(),
                req.getFormat(),
                req.getResolution(),
                req.getFps(),
                req.getQuality(),
                "queued",
                0.0,
                null,
                null,
                Instant.now(),
                null
        );
        return exportJobRepository.save(job);
    }
}
