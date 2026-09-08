package com.vjeditor.repository;

import com.vjeditor.entity.ExportJob;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class ExportJobRepository {
    private final Map<String, ExportJob> storage = new ConcurrentHashMap<>();

    public List<ExportJob> findByProjectId(String projectId) {
        return storage.values().stream()
                .filter(j -> projectId != null && projectId.equals(j.getProjectId()))
                .collect(Collectors.toList());
    }

    public List<ExportJob> findAll() {
        return new ArrayList<>(storage.values());
    }

    public Optional<ExportJob> findById(String id) {
        return Optional.ofNullable(storage.get(id));
    }

    public ExportJob save(ExportJob job) {
        storage.put(job.getId(), job);
        return job;
    }
}
