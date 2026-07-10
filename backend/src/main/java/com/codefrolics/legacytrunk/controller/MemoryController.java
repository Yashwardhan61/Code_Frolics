package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.StoryResponse;
import com.codefrolics.legacytrunk.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/memories")
@RequiredArgsConstructor
public class MemoryController {

    private final StoryService storyService;

    @GetMapping("/statistics")
    public ResponseEntity<com.codefrolics.legacytrunk.dto.MemoryStatisticsResponse> getMemoryStatistics() {
        return ResponseEntity.ok(storyService.getMemoryStatistics());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<StoryResponse>> searchMemories(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "authorId", required = false) Long authorId,
            @RequestParam(value = "mediaType", required = false) String mediaType,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        return ResponseEntity.ok(storyService.searchStories(
                query, startDate, endDate, authorId, mediaType, tags, location, sort, PageRequest.of(page, size)
        ));
    }
}
