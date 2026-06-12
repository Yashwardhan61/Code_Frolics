package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.FamilyMemberRequest;
import com.codefrolics.legacytrunk.dto.FamilyMemberResponse;
import com.codefrolics.legacytrunk.model.FamilyMember;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.FamilyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FamilyTreeService {

    private final FamilyMemberRepository familyMemberRepository;
    private final UserService userService;
    private final MediaStorageService mediaStorageService;

    @Transactional(readOnly = true)
    public List<FamilyMemberResponse> getTree(String treeType) {
        if (!"maternal".equals(treeType) && !"paternal".equals(treeType)) {
            throw new IllegalArgumentException("Invalid tree type");
        }
        
        User currentUser = userService.getCurrentUser();
        return familyMemberRepository.findByUserIdAndTreeTypeOrderByCreatedAtAsc(currentUser.getId(), treeType)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FamilyMemberResponse addMember(String treeType, FamilyMemberRequest request) {
        if (!"maternal".equals(treeType) && !"paternal".equals(treeType)) {
            throw new IllegalArgumentException("Invalid tree type");
        }

        User currentUser = userService.getCurrentUser();
        
        FamilyMember parent = null;
        if (request.getParentMemberId() != null) {
            parent = familyMemberRepository.findById(request.getParentMemberId())
                    .orElseThrow(() -> new RuntimeException("Parent member not found"));
            // Ensure parent belongs to same user and tree
            if (!parent.getUser().getId().equals(currentUser.getId()) || !parent.getTreeType().equals(treeType)) {
                throw new RuntimeException("Invalid parent member");
            }
        }

        FamilyMember member = FamilyMember.builder()
                .user(currentUser)
                .treeType(treeType)
                .name(request.getName())
                .relationship(request.getRelationship())
                .birthDate(request.getBirthDate())
                .deathDate(request.getDeathDate())
                .birthPlace(request.getBirthPlace())
                .bio(request.getBio())
                .parentMember(parent)
                .build();

        return mapToResponse(familyMemberRepository.save(member));
    }

    @Transactional
    public FamilyMemberResponse updateMember(String treeType, Long id, FamilyMemberRequest request) {
        User currentUser = userService.getCurrentUser();
        
        FamilyMember member = familyMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));
                
        if (!member.getUser().getId().equals(currentUser.getId()) || !member.getTreeType().equals(treeType)) {
            throw new RuntimeException("Unauthorized");
        }

        member.setName(request.getName());
        member.setRelationship(request.getRelationship());
        member.setBirthDate(request.getBirthDate());
        member.setDeathDate(request.getDeathDate());
        member.setBirthPlace(request.getBirthPlace());
        member.setBio(request.getBio());

        // Update parent if changed
        if (request.getParentMemberId() != null) {
            if (!request.getParentMemberId().equals(member.getParentMember() != null ? member.getParentMember().getId() : null)) {
                FamilyMember parent = familyMemberRepository.findById(request.getParentMemberId())
                        .orElseThrow(() -> new RuntimeException("Parent member not found"));
                member.setParentMember(parent);
            }
        } else {
            member.setParentMember(null);
        }

        return mapToResponse(familyMemberRepository.save(member));
    }

    @Transactional
    public void deleteMember(String treeType, Long id) {
        User currentUser = userService.getCurrentUser();
        
        FamilyMember member = familyMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));
                
        if (!member.getUser().getId().equals(currentUser.getId()) || !member.getTreeType().equals(treeType)) {
            throw new RuntimeException("Unauthorized");
        }

        if (member.getPhotoUrl() != null && member.getPhotoUrl().startsWith("/api/media/")) {
            String fileName = member.getPhotoUrl().substring("/api/media/".length());
            mediaStorageService.deleteFile(fileName);
        }

        familyMemberRepository.delete(member);
    }
    
    @Transactional
    public String uploadPhoto(String treeType, Long id, MultipartFile file) {
        User currentUser = userService.getCurrentUser();
        
        FamilyMember member = familyMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));
                
        if (!member.getUser().getId().equals(currentUser.getId()) || !member.getTreeType().equals(treeType)) {
            throw new RuntimeException("Unauthorized");
        }

        if (member.getPhotoUrl() != null && member.getPhotoUrl().startsWith("/api/media/")) {
            String oldFileName = member.getPhotoUrl().substring("/api/media/".length());
            mediaStorageService.deleteFile(oldFileName);
        }

        String fileName = mediaStorageService.storeFile(file, "family");
        String photoUrl = "/api/media/" + fileName;
        
        member.setPhotoUrl(photoUrl);
        familyMemberRepository.save(member);
        
        return photoUrl;
    }

    private FamilyMemberResponse mapToResponse(FamilyMember member) {
        return FamilyMemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .relationship(member.getRelationship())
                .birthDate(member.getBirthDate())
                .deathDate(member.getDeathDate())
                .birthPlace(member.getBirthPlace())
                .bio(member.getBio())
                .photoUrl(member.getPhotoUrl())
                .parentMemberId(member.getParentMember() != null ? member.getParentMember().getId() : null)
                .build();
    }
}
