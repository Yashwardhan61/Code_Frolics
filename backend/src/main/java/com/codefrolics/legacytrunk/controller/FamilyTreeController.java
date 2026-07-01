package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.FamilyMemberRequest;
import com.codefrolics.legacytrunk.dto.FamilyMemberResponse;
import com.codefrolics.legacytrunk.service.FamilyTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/family-tree")
@RequiredArgsConstructor
public class FamilyTreeController {

    private final FamilyTreeService familyTreeService;

    @GetMapping("/{type}")
    public ResponseEntity<List<FamilyMemberResponse>> getTree(@PathVariable String type) {
        return ResponseEntity.ok(familyTreeService.getTree(type));
    }

    @GetMapping("/member/{id}")
    public ResponseEntity<FamilyMemberResponse> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(familyTreeService.getMemberById(id));
    }

    @PostMapping("/{type}")
    public ResponseEntity<FamilyMemberResponse> addMember(
            @PathVariable String type,
            @RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(familyTreeService.addMember(type, request));
    }

    @PutMapping("/{type}/{id}")
    public ResponseEntity<FamilyMemberResponse> updateMember(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(familyTreeService.updateMember(type, id, request));
    }

    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<Void> deleteMember(
            @PathVariable String type,
            @PathVariable Long id) {
        familyTreeService.deleteMember(type, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{type}/{id}/photo")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String url = familyTreeService.uploadPhoto(type, id, file);
        return ResponseEntity.ok(Map.of("photoUrl", url));
    }
}
