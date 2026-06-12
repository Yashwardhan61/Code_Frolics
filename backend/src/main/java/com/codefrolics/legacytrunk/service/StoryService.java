package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.StoryRequest;
import com.codefrolics.legacytrunk.dto.StoryResponse;
import com.codefrolics.legacytrunk.model.*;
import com.codefrolics.legacytrunk.repository.StoryRepository;
import com.codefrolics.legacytrunk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final MediaStorageService mediaStorageService;

    @Transactional(readOnly = true)
    public List<StoryResponse> getAllStoriesForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        
        // Get own stories
        List<Story> ownStories = storyRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        
        // Get shared stories
        List<Story> sharedStories = storyRepository.findSharedWithUserOrderByCreatedAtDesc(currentUser.getId());
        
        // Combine and sort
        List<Story> allStories = new ArrayList<>(ownStories);
        allStories.addAll(sharedStories);
        allStories.sort((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt())); // Descending
        
        return allStories.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoryResponse getStoryById(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Story not found"));
                
        User currentUser = userService.getCurrentUser();
        
        // Check access
        if (!story.getUser().getId().equals(currentUser.getId())) {
            boolean isShared = story.getShares().stream()
                    .anyMatch(share -> share.getSharedWithUser().getId().equals(currentUser.getId()));
            if (!isShared) {
                throw new RuntimeException("Unauthorized to view this story");
            }
        }
        
        return mapToResponse(story);
    }

    @Transactional
    public StoryResponse createStory(StoryRequest request, MultipartFile[] files) {
        User currentUser = userService.getCurrentUser();
        
        Story story = Story.builder()
                .user(currentUser)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .storyDate(request.getStoryDate())
                .build();
                
        // Add tags
        if (request.getTags() != null) {
            List<StoryTag> tags = request.getTags().stream()
                    .map(tag -> StoryTag.builder().story(story).tag(tag).build())
                    .collect(Collectors.toList());
            story.setTags(tags);
        }
        
        // Handle file uploads
        if (files != null && files.length > 0) {
            List<StoryMedia> mediaFiles = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                
                String fileName = mediaStorageService.storeFile(file, "story");
                String mediaType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
                
                StoryMedia media = StoryMedia.builder()
                        .story(story)
                        .filePath(fileName)
                        .mediaType(mediaType)
                        .originalFilename(file.getOriginalFilename())
                        .fileSize(file.getSize())
                        .build();
                mediaFiles.add(media);
            }
            story.setMediaFiles(mediaFiles);
        }
        
        // Handle shares
        if (request.getSharedWithUserIds() != null) {
            List<StoryShare> shares = request.getSharedWithUserIds().stream()
                    .map(userId -> userRepository.findById(userId).orElse(null))
                    .filter(user -> user != null)
                    .map(user -> StoryShare.builder().story(story).sharedWithUser(user).build())
                    .collect(Collectors.toList());
            story.setShares(shares);
        }
        
        Story savedStory = storyRepository.save(story);
        return mapToResponse(savedStory);
    }

    @Transactional
    public void deleteStory(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Story not found"));
                
        User currentUser = userService.getCurrentUser();
        if (!story.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to delete this story");
        }
        
        // Delete physical files
        for (StoryMedia media : story.getMediaFiles()) {
            mediaStorageService.deleteFile(media.getFilePath());
        }
        
        storyRepository.delete(story);
    }

    private StoryResponse mapToResponse(Story story) {
        return StoryResponse.builder()
                .id(story.getId())
                .userId(story.getUser().getId())
                .authorName(story.getUser().getDisplayName() != null ? story.getUser().getDisplayName() : story.getUser().getEmail())
                .authorPhotoUrl(story.getUser().getPhotoUrl())
                .title(story.getTitle())
                .description(story.getDescription())
                .location(story.getLocation())
                .storyDate(story.getStoryDate())
                .tags(story.getTags().stream().map(StoryTag::getTag).collect(Collectors.toList()))
                .mediaFiles(story.getMediaFiles().stream().map(m -> 
                    StoryResponse.StoryMediaDto.builder()
                        .id(m.getId())
                        .mediaUrl("/api/media/" + m.getFilePath())
                        .mediaType(m.getMediaType())
                        .build()
                ).collect(Collectors.toList()))
                .createdAt(story.getCreatedAt())
                .build();
    }
}
