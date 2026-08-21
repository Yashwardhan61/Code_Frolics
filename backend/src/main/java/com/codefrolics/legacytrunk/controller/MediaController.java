package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.model.StoredMedia;
import com.codefrolics.legacytrunk.service.MediaStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Slf4j
public class MediaController {

    private final MediaStorageService mediaStorageService;

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        // 1. Try fetching from Neon database
        Optional<StoredMedia> mediaOpt = mediaStorageService.getStoredMedia(fileName);
        if (mediaOpt.isPresent()) {
            StoredMedia media = mediaOpt.get();
            String contentType = media.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            Resource resource = new ByteArrayResource(media.getData()) {
                @Override
                public String getFilename() {
                    return media.getFileName();
                }
            };

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + media.getFileName() + "\"")
                    .body(resource);
        }

        // 2. Fallback to local disk file
        Resource resource = mediaStorageService.loadFileAsResource(fileName);
        String contentType = null;
        try {
            if (resource.getFile() != null) {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            }
        } catch (IOException ex) {
            log.debug("Could not determine file type from disk: {}", ex.getMessage());
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
