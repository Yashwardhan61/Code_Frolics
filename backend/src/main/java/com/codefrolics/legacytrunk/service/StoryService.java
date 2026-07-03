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
    private final com.codefrolics.legacytrunk.repository.FamilyMemberRepository familyMemberRepository;

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

    @Transactional(readOnly = true)
    public List<StoryResponse> getStoriesByFamilyMember(Long familyMemberId) {
        List<Story> stories = storyRepository.findByFamilyMemberIdOrderByCreatedAtDesc(familyMemberId);
        return stories.stream().map(this::mapToResponse).collect(Collectors.toList());
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
                .unlockDateTime(request.getUnlockDateTime())
                .build();
                
        if (request.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new RuntimeException("Family member not found"));
            story.setFamilyMember(member);
        }
                
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
    public StoryResponse updateStory(Long id, StoryRequest request, MultipartFile[] files) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Story not found"));

        User currentUser = userService.getCurrentUser();
        if (!story.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to edit this story");
        }

        // Update basic fields
        story.setTitle(request.getTitle());
        story.setDescription(request.getDescription());
        story.setLocation(request.getLocation());
        story.setStoryDate(request.getStoryDate());
        story.setUnlockDateTime(request.getUnlockDateTime());

        if (request.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new RuntimeException("Family member not found"));
            story.setFamilyMember(member);
        } else {
            story.setFamilyMember(null);
        }

        // Replace tags
        story.getTags().clear();
        if (request.getTags() != null) {
            List<StoryTag> newTags = request.getTags().stream()
                    .map(tag -> StoryTag.builder().story(story).tag(tag).build())
                    .collect(Collectors.toList());
            story.getTags().addAll(newTags);
        }

        // Handle new file uploads (append)
        if (files != null && files.length > 0) {
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
                story.getMediaFiles().add(media);
            }
        }

        Story saved = storyRepository.save(story);
        return mapToResponse(saved);
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
        boolean isLocked = story.getUnlockDateTime() != null && java.time.LocalDateTime.now().isBefore(story.getUnlockDateTime());

        return StoryResponse.builder()
                .id(story.getId())
                .userId(story.getUser().getId())
                .authorName(story.getUser().getDisplayName() != null ? story.getUser().getDisplayName() : story.getUser().getEmail())
                .authorEmail(story.getUser().getEmail())
                .authorPhotoUrl(story.getUser().getPhotoUrl())
                .title(story.getTitle())
                .description(isLocked ? null : story.getDescription())
                .location(story.getLocation())
                .storyDate(story.getStoryDate())
                .tags(story.getTags().stream().map(StoryTag::getTag).collect(Collectors.toList()))
                .mediaFiles(isLocked ? java.util.Collections.emptyList() : story.getMediaFiles().stream().map(m -> 
                    StoryResponse.StoryMediaDto.builder()
                        .id(m.getId())
                        .mediaUrl("/api/media/" + m.getFilePath())
                        .mediaType(m.getMediaType())
                        .build()
                ).collect(Collectors.toList()))
                .createdAt(story.getCreatedAt())
                .familyMemberId(story.getFamilyMember() != null ? story.getFamilyMember().getId() : null)
                .familyMemberName(story.getFamilyMember() != null ? story.getFamilyMember().getName() : null)
                .unlockDateTime(story.getUnlockDateTime())
                .isLocked(isLocked)
                .build();
    }
}
