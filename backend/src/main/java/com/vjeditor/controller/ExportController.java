package com.vjeditor.controller;

import com.vjeditor.dto.ExportRequest;
import com.vjeditor.entity.ExportJob;
import com.vjeditor.service.ExportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exports")
public class ExportController {
    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping
    public List<ExportJob> getExports(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return exportService.getByProject(projectId);
        }
        return List.of();
    }

    @GetMapping("/{id}")
    public ExportJob getExportById(@PathVariable String id) {
        return exportService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ExportJob createExport(@Valid @RequestBody ExportRequest request) {
        return exportService.createJob(request);
    }
}
