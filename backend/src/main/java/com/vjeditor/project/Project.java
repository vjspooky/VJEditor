package com.vjeditor.project;

import java.time.Instant;

public record Project(
        String id,
        String name,
        int duration,
        String aspectRatio,
        String thumbnailColor,
        Instant createdAt,
        Instant updatedAt,
        String source,
        String prompt,
        String language,
        String voice,
        String style
) {
}
