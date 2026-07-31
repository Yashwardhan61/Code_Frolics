package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemoryStatisticsResponse {
    private long totalStories;
    private long totalPhotos;
    private long totalVideos;
    private long totalAudios;
    private long totalTextOnly;
    private long totalViews;
    private Map<String, Long> topTags;
    private Map<String, Long> topLocations;
}
