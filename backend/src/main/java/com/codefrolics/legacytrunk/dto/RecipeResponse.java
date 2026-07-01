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
public class RecipeResponse {
    private Long id;
    private Long userId;
    private String authorName;
    private String authorPhotoUrl;
    private String title;
    private String description;
    private String cookingTime;
    private String servings;
    private Long familyMemberId;
    private String familyMemberName;
    private List<String> tags;
    private List<IngredientDto> ingredients;
    private List<StepDto> steps;
    private List<MediaDto> mediaFiles;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IngredientDto {
        private Long id;
        private String name;
        private String quantity;
        private String unit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StepDto {
        private Long id;
        private Integer stepNumber;
        private String instruction;
    }

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
