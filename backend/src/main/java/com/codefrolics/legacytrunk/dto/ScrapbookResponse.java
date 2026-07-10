package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScrapbookResponse {
    private Long id;
    private Long userId;
    private String authorName;
    private String title;
    private String description;
    private String canvasData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
