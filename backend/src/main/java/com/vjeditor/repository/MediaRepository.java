package com.vjeditor.repository;

import com.vjeditor.entity.MediaAsset;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class MediaRepository {
    private final Map<String, MediaAsset> storage = new ConcurrentHashMap<>();

    public List<MediaAsset> findByProjectId(String projectId) {
        return storage.values().stream()
                .filter(m -> projectId != null && projectId.equals(m.getProjectId()))
                .collect(Collectors.toList());
    }

    public List<MediaAsset> findAll() {
        return new ArrayList<>(storage.values());
    }

    public Optional<MediaAsset> findById(String id) {
        return Optional.ofNullable(storage.get(id));
    }

    public MediaAsset save(MediaAsset asset) {
        storage.put(asset.getId(), asset);
        return asset;
    }

    public boolean deleteById(String id) {
        return storage.remove(id) != null;
    }
}
