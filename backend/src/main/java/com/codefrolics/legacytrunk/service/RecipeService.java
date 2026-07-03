package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.RecipeRequest;
import com.codefrolics.legacytrunk.dto.RecipeResponse;
import com.codefrolics.legacytrunk.model.*;
import com.codefrolics.legacytrunk.repository.FamilyMemberRepository;
import com.codefrolics.legacytrunk.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserService userService;
    private final MediaStorageService mediaStorageService;
    private final FamilyMemberRepository familyMemberRepository;

    @Transactional(readOnly = true)
    public List<RecipeResponse> getAllRecipesForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        List<Recipe> recipes = recipeRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return recipes.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecipeResponse getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return mapToResponse(recipe);
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> getRecipesByFamilyMember(Long familyMemberId) {
        List<Recipe> recipes = recipeRepository.findByFamilyMemberIdOrderByCreatedAtDesc(familyMemberId);
        return recipes.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public RecipeResponse createRecipe(RecipeRequest request, MultipartFile[] files) {
        User currentUser = userService.getCurrentUser();

        Recipe recipe = Recipe.builder()
                .user(currentUser)
                .title(request.getTitle())
                .description(request.getDescription())
                .cookingTime(request.getCookingTime())
                .servings(request.getServings())
                .build();

        if (request.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new RuntimeException("Family member not found"));
            recipe.setFamilyMember(member);
        }

        if (request.getIngredients() != null) {
            List<RecipeIngredient> ingredients = new ArrayList<>();
            for (int i = 0; i < request.getIngredients().size(); i++) {
                RecipeRequest.IngredientDto dto = request.getIngredients().get(i);
                ingredients.add(RecipeIngredient.builder()
                        .recipe(recipe)
                        .name(dto.getName())
                        .quantity(dto.getQuantity())
                        .unit(dto.getUnit())
                        .sortOrder(i)
                        .build());
            }
            recipe.setIngredients(ingredients);
        }

        if (request.getSteps() != null) {
            List<RecipeStep> steps = new ArrayList<>();
            for (int i = 0; i < request.getSteps().size(); i++) {
                steps.add(RecipeStep.builder()
                        .recipe(recipe)
                        .stepNumber(i + 1)
                        .instruction(request.getSteps().get(i))
                        .build());
            }
            recipe.setSteps(steps);
        }

        if (request.getTags() != null) {
            List<RecipeTag> tags = request.getTags().stream()
                    .map(tag -> RecipeTag.builder().recipe(recipe).tag(tag).build())
                    .collect(Collectors.toList());
            recipe.setTags(tags);
        }

        if (files != null && files.length > 0) {
            List<RecipeMedia> mediaFiles = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String fileName = mediaStorageService.storeFile(file, "recipe");
                String mediaType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
                RecipeMedia media = RecipeMedia.builder()
                        .recipe(recipe)
                        .filePath(fileName)
                        .mediaType(mediaType)
                        .originalFilename(file.getOriginalFilename())
                        .fileSize(file.getSize())
                        .build();
                mediaFiles.add(media);
            }
            recipe.setMediaFiles(mediaFiles);
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        return mapToResponse(savedRecipe);
    }

    @Transactional
    public RecipeResponse updateRecipe(Long id, RecipeRequest request, MultipartFile[] files) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        User currentUser = userService.getCurrentUser();
        if (!recipe.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to edit this recipe");
        }

        recipe.setTitle(request.getTitle());
        recipe.setDescription(request.getDescription());
        recipe.setCookingTime(request.getCookingTime());
        recipe.setServings(request.getServings());

        if (request.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new RuntimeException("Family member not found"));
            recipe.setFamilyMember(member);
        } else {
            recipe.setFamilyMember(null);
        }

        recipe.getIngredients().clear();
        if (request.getIngredients() != null) {
            for (int i = 0; i < request.getIngredients().size(); i++) {
                RecipeRequest.IngredientDto dto = request.getIngredients().get(i);
                recipe.getIngredients().add(RecipeIngredient.builder()
                        .recipe(recipe)
                        .name(dto.getName())
                        .quantity(dto.getQuantity())
                        .unit(dto.getUnit())
                        .sortOrder(i)
                        .build());
            }
        }

        recipe.getSteps().clear();
        if (request.getSteps() != null) {
            for (int i = 0; i < request.getSteps().size(); i++) {
                recipe.getSteps().add(RecipeStep.builder()
                        .recipe(recipe)
                        .stepNumber(i + 1)
                        .instruction(request.getSteps().get(i))
                        .build());
            }
        }

        recipe.getTags().clear();
        if (request.getTags() != null) {
            List<RecipeTag> tags = request.getTags().stream()
                    .map(tag -> RecipeTag.builder().recipe(recipe).tag(tag).build())
                    .collect(Collectors.toList());
            recipe.getTags().addAll(tags);
        }

        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String fileName = mediaStorageService.storeFile(file, "recipe");
                String mediaType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
                RecipeMedia media = RecipeMedia.builder()
                        .recipe(recipe)
                        .filePath(fileName)
                        .mediaType(mediaType)
                        .originalFilename(file.getOriginalFilename())
                        .fileSize(file.getSize())
                        .build();
                recipe.getMediaFiles().add(media);
            }
        }

        Recipe saved = recipeRepository.save(recipe);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        User currentUser = userService.getCurrentUser();
        if (!recipe.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to delete this recipe");
        }

        for (RecipeMedia media : recipe.getMediaFiles()) {
            mediaStorageService.deleteFile(media.getFilePath());
        }

        recipeRepository.delete(recipe);
    }

    private RecipeResponse mapToResponse(Recipe recipe) {
        return RecipeResponse.builder()
                .id(recipe.getId())
                .userId(recipe.getUser().getId())
                .authorName(recipe.getUser().getDisplayName() != null ? recipe.getUser().getDisplayName() : recipe.getUser().getEmail())
                .authorPhotoUrl(recipe.getUser().getPhotoUrl())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .cookingTime(recipe.getCookingTime())
                .servings(recipe.getServings())
                .familyMemberId(recipe.getFamilyMember() != null ? recipe.getFamilyMember().getId() : null)
                .familyMemberName(recipe.getFamilyMember() != null ? recipe.getFamilyMember().getName() : null)
                .tags(recipe.getTags().stream().map(RecipeTag::getTag).collect(Collectors.toList()))
                .ingredients(recipe.getIngredients().stream().map(i ->
                        RecipeResponse.IngredientDto.builder()
                                .id(i.getId())
                                .name(i.getName())
                                .quantity(i.getQuantity())
                                .unit(i.getUnit())
                                .build()
                ).collect(Collectors.toList()))
                .steps(recipe.getSteps().stream().map(s ->
                        RecipeResponse.StepDto.builder()
                                .id(s.getId())
                                .stepNumber(s.getStepNumber())
                                .instruction(s.getInstruction())
                                .build()
                ).collect(Collectors.toList()))
                .mediaFiles(recipe.getMediaFiles().stream().map(m ->
                        RecipeResponse.MediaDto.builder()
                                .id(m.getId())
                                .mediaUrl("/api/media/" + m.getFilePath())
                                .mediaType(m.getMediaType())
                                .build()
                ).collect(Collectors.toList()))
                .createdAt(recipe.getCreatedAt())
                .build();
    }
}
