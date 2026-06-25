package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeRequest {
    private String title;
    private String description;
    private String cookingTime;
    private String servings;
    private Long familyMemberId;
    private List<String> tags;
    private List<IngredientDto> ingredients;
    private List<String> steps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IngredientDto {
        private String name;
        private String quantity;
        private String unit;
    }
}
