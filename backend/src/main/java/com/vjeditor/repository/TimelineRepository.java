package com.vjeditor.repository;

import com.vjeditor.entity.Timeline;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class TimelineRepository {
    private final Map<String, Timeline> storage = new ConcurrentHashMap<>();

    public Optional<Timeline> findByProjectId(String projectId) {
        return storage.values().stream()
                .filter(t -> projectId != null && projectId.equals(t.getProjectId()))
                .findFirst();
    }

    public Optional<Timeline> findById(String id) {
        return Optional.ofNullable(storage.get(id));
    }

    public Timeline save(Timeline timeline) {
        storage.put(timeline.getId(), timeline);
        return timeline;
    }

    public boolean deleteById(String id) {
        return storage.remove(id) != null;
    }
}
