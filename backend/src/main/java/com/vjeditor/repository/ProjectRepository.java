package com.vjeditor.repository;

import com.vjeditor.entity.Project;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class ProjectRepository {
    private final Map<String, Project> storage = new ConcurrentHashMap<>();

    public List<Project> findAll() {
        return new ArrayList<>(storage.values());
    }

    public Optional<Project> findById(String id) {
        return Optional.ofNullable(storage.get(id));
    }

    public Project save(Project project) {
        storage.put(project.getId(), project);
        return project;
    }

    public boolean deleteById(String id) {
        return storage.remove(id) != null;
    }
}
