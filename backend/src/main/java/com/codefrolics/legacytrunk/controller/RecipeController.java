package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.RecipeRequest;
import com.codefrolics.legacytrunk.dto.RecipeResponse;
import com.codefrolics.legacytrunk.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeResponse>> getAllRecipes() {
        return ResponseEntity.ok(recipeService.getAllRecipesForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> getRecipeById(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<RecipeResponse>> getRecipesByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(recipeService.getRecipesByFamilyMember(memberId));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<RecipeResponse> createRecipe(
            @RequestPart("recipe") RecipeRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return ResponseEntity.ok(recipeService.createRecipe(request, files));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<RecipeResponse> updateRecipe(
            @PathVariable Long id,
            @RequestPart("recipe") RecipeRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, request, files));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
