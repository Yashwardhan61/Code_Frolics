package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryResponse {
    private Long id;
    private Long userId;
    private String authorName;
    private String authorEmail;
    private String authorPhotoUrl;
    private String title;
    private String description;
    private String location;
    private LocalDate storyDate;
    private List<String> tags;
    private List<StoryMediaDto> mediaFiles;
    private Long familyMemberId;
    private String familyMemberName;
    private LocalDateTime createdAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoryMediaDto {
        private Long id;
        private String mediaUrl;
        private String mediaType;
    }
}
