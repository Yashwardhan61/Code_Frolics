package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryItemResponse {
    private Long mediaId;
    private String mediaUrl;
    private String mediaType;
    private String originalFilename;
    private Long storyId;
    private String storyTitle;
}
