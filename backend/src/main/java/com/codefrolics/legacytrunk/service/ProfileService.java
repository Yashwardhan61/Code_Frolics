package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.ProfileRequest;
import com.codefrolics.legacytrunk.dto.ProfileResponse;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.FamilyMemberRepository;
import com.codefrolics.legacytrunk.repository.FriendRepository;
import com.codefrolics.legacytrunk.repository.StoryRepository;
import com.codefrolics.legacytrunk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final StoryRepository storyRepository;
    private final FriendRepository friendRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final UserService userService;
    private final MediaStorageService mediaStorageService;

    @Transactional(readOnly = true)
    public ProfileResponse getCurrentUserProfile() {
        User user = userService.getCurrentUser();
        
        long storyCount = storyRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size();
        long friendCount = friendRepository.findByUserId(user.getId()).size();
        
        // Sum maternal and paternal members
        long maternalCount = familyMemberRepository.findByUserIdAndTreeTypeOrderByCreatedAtAsc(user.getId(), "maternal").size();
        long paternalCount = familyMemberRepository.findByUserIdAndTreeTypeOrderByCreatedAtAsc(user.getId(), "paternal").size();
        long familyCount = maternalCount + paternalCount;
        
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .username(user.getUsername())
                .description(user.getDescription())
                .photoUrl(user.getPhotoUrl())
                .hasChangedUsername(user.getHasChangedUsername())
                .profileSetupComplete(user.getProfileSetupComplete())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .storyCount(storyCount)
                .friendCount(friendCount)
                .familyMemberCount(familyCount)
                .build();
    }

    @Transactional
    public ProfileResponse updateProfile(ProfileRequest request) {
        User user = userService.getCurrentUser();
        
        user.setDisplayName(request.getDisplayName());
        user.setDescription(request.getDescription());
        
        // Handle username change (allowed only once usually, but keeping it flexible here)
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            // Check if username taken
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username already taken");
            }
            user.setUsername(request.getUsername());
            user.setHasChangedUsername(true);
        }
        
        user.setProfileSetupComplete(true);
        userRepository.save(user);
        
        return getCurrentUserProfile();
    }
    
    @Transactional
    public String uploadProfilePhoto(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        User user = userService.getCurrentUser();
        
        // Delete old photo if exists (and is local)
        if (user.getPhotoUrl() != null && user.getPhotoUrl().startsWith("/api/media/")) {
            String oldFileName = user.getPhotoUrl().substring("/api/media/".length());
            mediaStorageService.deleteFile(oldFileName);
        }
        
        String fileName = mediaStorageService.storeFile(file, "profile");
        String photoUrl = "/api/media/" + fileName;
        
        user.setPhotoUrl(photoUrl);
        userRepository.save(user);
        
        return photoUrl;
    }
}
