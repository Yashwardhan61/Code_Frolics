package com.codefrolics.legacytrunk.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 10000, message = "Description must not exceed 10000 characters")
    private String description;

    @Size(max = 100, message = "Cooking time must not exceed 100 characters")
    private String cookingTime;

    @Size(max = 100, message = "Servings must not exceed 100 characters")
    private String servings;

    private Long familyMemberId;
    private List<String> tags;

    private List<@Valid IngredientDto> ingredients;
    private List<String> steps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IngredientDto {

        @NotBlank(message = "Ingredient name is required")
        @Size(max = 255, message = "Ingredient name must not exceed 255 characters")
        private String name;

        @Size(max = 100, message = "Quantity must not exceed 100 characters")
        private String quantity;

        @Size(max = 50, message = "Unit must not exceed 50 characters")
        private String unit;
    }
}
