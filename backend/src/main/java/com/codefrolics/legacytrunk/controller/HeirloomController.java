package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.HeirloomRequest;
import com.codefrolics.legacytrunk.dto.HeirloomResponse;
import com.codefrolics.legacytrunk.service.HeirloomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/heirlooms")
@RequiredArgsConstructor
public class HeirloomController {

    private final HeirloomService heirloomService;

    @GetMapping
    public ResponseEntity<List<HeirloomResponse>> getAllHeirlooms() {
        return ResponseEntity.ok(heirloomService.getAllHeirloomsForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HeirloomResponse> getHeirloomById(@PathVariable Long id) {
        return ResponseEntity.ok(heirloomService.getHeirloomById(id));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<HeirloomResponse>> getHeirloomsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(heirloomService.getHeirloomsByFamilyMember(memberId));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<HeirloomResponse> createHeirloom(
            @RequestPart("heirloom") HeirloomRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return ResponseEntity.ok(heirloomService.createHeirloom(request, files));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<HeirloomResponse> updateHeirloom(
            @PathVariable Long id,
            @RequestPart("heirloom") HeirloomRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return ResponseEntity.ok(heirloomService.updateHeirloom(id, request, files));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<Void> deleteHeirloom(@PathVariable Long id) {
        heirloomService.deleteHeirloom(id);
        return ResponseEntity.noContent().build();
    }
}
