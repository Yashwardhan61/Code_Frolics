package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.HeirloomRequest;
import com.codefrolics.legacytrunk.dto.HeirloomResponse;
import com.codefrolics.legacytrunk.model.*;
import com.codefrolics.legacytrunk.repository.FamilyMemberRepository;
import com.codefrolics.legacytrunk.repository.HeirloomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeirloomService {

    private final HeirloomRepository heirloomRepository;
    private final UserService userService;
    private final MediaStorageService mediaStorageService;
    private final FamilyMemberRepository familyMemberRepository;

    @Transactional(readOnly = true)
    public List<HeirloomResponse> getAllHeirloomsForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        List<Heirloom> heirlooms = heirloomRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return heirlooms.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HeirloomResponse getHeirloomById(Long id) {
        Heirloom heirloom = heirloomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Heirloom not found"));
        return mapToResponse(heirloom);
    }

    @Transactional(readOnly = true)
    public List<HeirloomResponse> getHeirloomsByFamilyMember(Long familyMemberId) {
        List<Heirloom> heirlooms = heirloomRepository.findByFamilyMemberIdOrderByCreatedAtDesc(familyMemberId);
        return heirlooms.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public HeirloomResponse createHeirloom(HeirloomRequest request, MultipartFile[] files) {
        User currentUser = userService.getCurrentUser();

        Heirloom heirloom = Heirloom.builder()
                .user(currentUser)
                .name(request.getName())
                .description(request.getDescription())
                .currentOwner(request.getCurrentOwner())
                .nextOwner(request.getNextOwner())
                .estimatedYear(request.getEstimatedYear())
                .build();

        if (request.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new RuntimeException("Family member not found"));
            heirloom.setFamilyMember(member);
        }

        if (request.getTags() != null) {
            List<HeirloomTag> tags = request.getTags().stream()
                    .map(tag -> HeirloomTag.builder().heirloom(heirloom).tag(tag).build())
                    .collect(Collectors.toList());
            heirloom.setTags(tags);
        }

        if (files != null && files.length > 0) {
            List<HeirloomMedia> mediaFiles = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String fileName = mediaStorageService.storeFile(file, "heirloom");
                String mediaType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
                HeirloomMedia media = HeirloomMedia.builder()
                        .heirloom(heirloom)
                        .filePath(fileName)
                        .mediaType(mediaType)
                        .originalFilename(file.getOriginalFilename())
                        .fileSize(file.getSize())
                        .build();
                mediaFiles.add(media);
            }
            heirloom.setMediaFiles(mediaFiles);
        }

        Heirloom savedHeirloom = heirloomRepository.save(heirloom);
        return mapToResponse(savedHeirloom);
    }

    @Transactional
    public HeirloomResponse updateHeirloom(Long id, HeirloomRequest request, MultipartFile[] files) {
        Heirloom heirloom = heirloomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Heirloom not found"));

        User currentUser = userService.getCurrentUser();
        if (!heirloom.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to edit this heirloom");
        }

        heirloom.setName(request.getName());
        heirloom.setDescription(request.getDescription());
        heirloom.setCurrentOwner(request.getCurrentOwner());
        heirloom.setNextOwner(request.getNextOwner());
        heirloom.setEstimatedYear(request.getEstimatedYear());

        if (request.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new RuntimeException("Family member not found"));
            heirloom.setFamilyMember(member);
        } else {
            heirloom.setFamilyMember(null);
        }

        heirloom.getTags().clear();
        if (request.getTags() != null) {
            List<HeirloomTag> tags = request.getTags().stream()
                    .map(tag -> HeirloomTag.builder().heirloom(heirloom).tag(tag).build())
                    .collect(Collectors.toList());
            heirloom.getTags().addAll(tags);
        }

        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String fileName = mediaStorageService.storeFile(file, "heirloom");
                String mediaType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
                HeirloomMedia media = HeirloomMedia.builder()
                        .heirloom(heirloom)
                        .filePath(fileName)
                        .mediaType(mediaType)
                        .originalFilename(file.getOriginalFilename())
                        .fileSize(file.getSize())
                        .build();
                heirloom.getMediaFiles().add(media);
            }
        }

        Heirloom saved = heirloomRepository.save(heirloom);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteHeirloom(Long id) {
        Heirloom heirloom = heirloomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Heirloom not found"));

        User currentUser = userService.getCurrentUser();
        if (!heirloom.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to delete this heirloom");
        }

        for (HeirloomMedia media : heirloom.getMediaFiles()) {
            mediaStorageService.deleteFile(media.getFilePath());
        }

        heirloomRepository.delete(heirloom);
    }

    private HeirloomResponse mapToResponse(Heirloom heirloom) {
        return HeirloomResponse.builder()
                .id(heirloom.getId())
                .userId(heirloom.getUser().getId())
                .authorName(heirloom.getUser().getDisplayName() != null ? heirloom.getUser().getDisplayName() : heirloom.getUser().getEmail())
                .authorPhotoUrl(heirloom.getUser().getPhotoUrl())
                .name(heirloom.getName())
                .description(heirloom.getDescription())
                .currentOwner(heirloom.getCurrentOwner())
                .nextOwner(heirloom.getNextOwner())
                .estimatedYear(heirloom.getEstimatedYear())
                .familyMemberId(heirloom.getFamilyMember() != null ? heirloom.getFamilyMember().getId() : null)
                .familyMemberName(heirloom.getFamilyMember() != null ? heirloom.getFamilyMember().getName() : null)
                .tags(heirloom.getTags().stream().map(HeirloomTag::getTag).collect(Collectors.toList()))
                .mediaFiles(heirloom.getMediaFiles().stream().map(m ->
                        HeirloomResponse.MediaDto.builder()
                                .id(m.getId())
                                .mediaUrl("/api/media/" + m.getFilePath())
                                .mediaType(m.getMediaType())
                                .build()
                ).collect(Collectors.toList()))
                .createdAt(heirloom.getCreatedAt())
                .build();
    }
}
