package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeirloomResponse {
    private Long id;
    private Long userId;
    private String authorName;
    private String authorPhotoUrl;
    private String name;
    private String description;
    private String currentOwner;
    private String nextOwner;
    private String estimatedYear;
    private Long familyMemberId;
    private String familyMemberName;
    private List<String> tags;
    private List<MediaDto> mediaFiles;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MediaDto {
        private Long id;
        private String mediaUrl;
        private String mediaType;
    }
}
