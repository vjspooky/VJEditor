package com.vjeditor.project;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ProjectRequest(
        @NotBlank String name,
        @Min(1) int duration,
        @NotBlank String aspectRatio,
        @NotBlank String source,
        String prompt,
        String language,
        String voice,
        String style
) {
}
