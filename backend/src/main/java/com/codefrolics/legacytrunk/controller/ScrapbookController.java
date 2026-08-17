package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.ScrapbookRequest;
import com.codefrolics.legacytrunk.dto.ScrapbookResponse;
import com.codefrolics.legacytrunk.service.ScrapbookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scrapbooks")
@RequiredArgsConstructor
public class ScrapbookController {

    private final ScrapbookService scrapbookService;

    @GetMapping
    public ResponseEntity<List<ScrapbookResponse>> getAllScrapbooks() {
        return ResponseEntity.ok(scrapbookService.getAllScrapbooksForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScrapbookResponse> getScrapbookById(@PathVariable Long id) {
        return ResponseEntity.ok(scrapbookService.getScrapbookById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<ScrapbookResponse> createScrapbook(@Valid @RequestBody ScrapbookRequest request) {
        return ResponseEntity.ok(scrapbookService.createScrapbook(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<ScrapbookResponse> updateScrapbook(
            @PathVariable Long id,
            @Valid @RequestBody ScrapbookRequest request) {
        return ResponseEntity.ok(scrapbookService.updateScrapbook(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<Void> deleteScrapbook(@PathVariable Long id) {
        scrapbookService.deleteScrapbook(id);
        return ResponseEntity.noContent().build();
    }
}
