package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScrapbookRequest {
    private String title;
    private String description;
    private String canvasData;
}
