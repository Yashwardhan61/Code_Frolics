package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.MemoryStatisticsResponse;
import com.codefrolics.legacytrunk.dto.StoryRequest;
import com.codefrolics.legacytrunk.dto.StoryResponse;
import com.codefrolics.legacytrunk.model.Role;
import com.codefrolics.legacytrunk.model.Story;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.FamilyMemberRepository;
import com.codefrolics.legacytrunk.repository.StoryRepository;
import com.codefrolics.legacytrunk.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StoryServiceTest {

    @Mock
    private StoryRepository storyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private MediaStorageService mediaStorageService;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private StoryService storyService;

    private User testUser;
    private Story testStory;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .displayName("Test User")
                .role(Role.MEMBER)
                .build();

        testStory = Story.builder()
                .id(100L)
                .title("A Trip to the Mountains")
                .description("Scenic views and family picnic.")
                .location("Alps")
                .storyDate(LocalDate.of(2023, 6, 15))
                .user(testUser)
                .createdAt(LocalDateTime.now())
                .mediaFiles(new ArrayList<>())
                .tags(new ArrayList<>())
                .shares(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("getAllStoriesForCurrentUser returns combined own and shared stories")
    void testGetAllStoriesForCurrentUser() {
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(storyRepository.findByUserIdOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(List.of(testStory));
        when(storyRepository.findSharedWithUserOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(List.of());

        List<StoryResponse> result = storyService.getAllStoriesForCurrentUser();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("A Trip to the Mountains", result.get(0).getTitle());
        verify(storyRepository, times(1)).findByUserIdOrderByCreatedAtDesc(testUser.getId());
    }

    @Test
    @DisplayName("getStoryById returns story when user is owner")
    void testGetStoryById_Success() {
        when(storyRepository.findById(100L)).thenReturn(Optional.of(testStory));
        when(userService.getCurrentUser()).thenReturn(testUser);

        StoryResponse response = storyService.getStoryById(100L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("A Trip to the Mountains", response.getTitle());
    }

    @Test
    @DisplayName("getStoryById throws exception when story not found")
    void testGetStoryById_NotFound() {
        when(storyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> storyService.getStoryById(999L));
    }

    @Test
    @DisplayName("createStory creates story without media files")
    void testCreateStory_WithoutFiles() {
        StoryRequest request = StoryRequest.builder()
                .title("Summer Feast")
                .description("Grand family gathering")
                .location("Home")
                .storyDate(LocalDate.of(2024, 7, 10))
                .build();

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(storyRepository.save(any(Story.class))).thenAnswer(invocation -> {
            Story saved = invocation.getArgument(0);
            saved.setId(101L);
            return saved;
        });

        StoryResponse response = storyService.createStory(request, null);

        assertNotNull(response);
        assertEquals("Summer Feast", response.getTitle());
        verify(storyRepository, times(1)).save(any(Story.class));
    }

    @Test
    @DisplayName("deleteStory removes story when user is author")
    void testDeleteStory_Owner() {
        when(storyRepository.findById(100L)).thenReturn(Optional.of(testStory));
        when(userService.getCurrentUser()).thenReturn(testUser);

        assertDoesNotThrow(() -> storyService.deleteStory(100L));
        verify(storyRepository, times(1)).delete(testStory);
    }

    @Test
    @DisplayName("deleteStory throws exception when unauthorized user tries to delete")
    void testDeleteStory_Unauthorized() {
        User otherUser = User.builder().id(2L).role(Role.MEMBER).build();
        when(storyRepository.findById(100L)).thenReturn(Optional.of(testStory));
        when(userService.getCurrentUser()).thenReturn(otherUser);

        assertThrows(RuntimeException.class, () -> storyService.deleteStory(100L));
        verify(storyRepository, never()).delete(any(Story.class));
    }

    @Test
    @DisplayName("getMemoryStatistics returns valid counts")
    void testGetMemoryStatistics() {
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(storyRepository.findByUserIdOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(List.of(testStory));
        when(storyRepository.findSharedWithUserOrderByCreatedAtDesc(testUser.getId()))
                .thenReturn(List.of());

        MemoryStatisticsResponse stats = storyService.getMemoryStatistics();

        assertNotNull(stats);
        assertEquals(1, stats.getTotalStories());
        assertTrue(stats.getTopLocations().containsKey("Alps"));
    }
}
