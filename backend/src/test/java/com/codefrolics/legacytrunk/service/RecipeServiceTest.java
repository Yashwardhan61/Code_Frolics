package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.RecipeRequest;
import com.codefrolics.legacytrunk.dto.RecipeResponse;
import com.codefrolics.legacytrunk.model.FamilyMember;
import com.codefrolics.legacytrunk.model.Recipe;
import com.codefrolics.legacytrunk.model.Role;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.FamilyMemberRepository;
import com.codefrolics.legacytrunk.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserService userService;

    @Mock
    private MediaStorageService mediaStorageService;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @InjectMocks
    private RecipeService recipeService;

    private User testUser;
    private Recipe testRecipe;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("chef@example.com")
                .displayName("Grandma Baker")
                .role(Role.MEMBER)
                .build();

        testRecipe = Recipe.builder()
                .id(200L)
                .title("Secret Cardamom Cake")
                .description("Heritage cake recipe passed down 3 generations.")
                .cookingTime("45 mins")
                .servings("8 people")
                .user(testUser)
                .createdAt(LocalDateTime.now())
                .ingredients(new ArrayList<>())
                .steps(new ArrayList<>())
                .tags(new ArrayList<>())
                .mediaFiles(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("getAllRecipesForCurrentUser returns user recipes")
    void testGetAllRecipesForCurrentUser() {
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(recipeRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testRecipe));

        List<RecipeResponse> results = recipeService.getAllRecipesForCurrentUser();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Secret Cardamom Cake", results.get(0).getTitle());
    }

    @Test
    @DisplayName("getRecipeById returns recipe when found")
    void testGetRecipeById_Success() {
        when(recipeRepository.findById(200L)).thenReturn(Optional.of(testRecipe));

        RecipeResponse response = recipeService.getRecipeById(200L);

        assertNotNull(response);
        assertEquals(200L, response.getId());
        assertEquals("Secret Cardamom Cake", response.getTitle());
    }

    @Test
    @DisplayName("createRecipe creates recipe and links family member")
    void testCreateRecipe_WithFamilyMember() {
        FamilyMember grandma = FamilyMember.builder()
                .id(10L)
                .name("Grandma Rose")
                .relationship("Grandmother")
                .build();

        RecipeRequest request = RecipeRequest.builder()
                .title("Rose's Sweet Bread")
                .description("Traditional festive bread.")
                .cookingTime("60 mins")
                .servings("6")
                .familyMemberId(10L)
                .ingredients(List.of(
                        RecipeRequest.IngredientDto.builder().name("Flour").quantity("2").unit("cups").build(),
                        RecipeRequest.IngredientDto.builder().name("Sugar").quantity("1").unit("cup").build()
                ))
                .steps(List.of("Mix ingredients", "Bake at 350F"))
                .tags(List.of("Baking", "Holiday"))
                .build();

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(familyMemberRepository.findById(10L)).thenReturn(Optional.of(grandma));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> {
            Recipe r = i.getArgument(0);
            r.setId(201L);
            return r;
        });

        RecipeResponse response = recipeService.createRecipe(request, null);

        assertNotNull(response);
        assertEquals("Rose's Sweet Bread", response.getTitle());
        verify(recipeRepository, times(1)).save(any(Recipe.class));
    }

    @Test
    @DisplayName("deleteRecipe allows author to delete")
    void testDeleteRecipe_Success() {
        when(recipeRepository.findById(200L)).thenReturn(Optional.of(testRecipe));
        when(userService.getCurrentUser()).thenReturn(testUser);

        assertDoesNotThrow(() -> recipeService.deleteRecipe(200L));
        verify(recipeRepository, times(1)).delete(testRecipe);
    }
}
