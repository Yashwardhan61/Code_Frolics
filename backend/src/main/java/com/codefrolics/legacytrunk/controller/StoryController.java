package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.StoryRequest;
import com.codefrolics.legacytrunk.dto.StoryResponse;
import com.codefrolics.legacytrunk.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    @GetMapping
    public ResponseEntity<List<StoryResponse>> getAllStories() {
        return ResponseEntity.ok(storyService.getAllStoriesForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoryResponse> getStoryById(@PathVariable Long id) {
        return ResponseEntity.ok(storyService.getStoryById(id));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<StoryResponse>> getStoriesByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(storyService.getStoriesByFamilyMember(memberId));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<StoryResponse> createStory(
            @RequestPart("story") StoryRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return ResponseEntity.ok(storyService.createStory(request, files));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<StoryResponse> updateStory(
            @PathVariable Long id,
            @RequestPart("story") StoryRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return ResponseEntity.ok(storyService.updateStory(id, request, files));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id) {
        storyService.deleteStory(id);
        return ResponseEntity.noContent().build();
    }
}
