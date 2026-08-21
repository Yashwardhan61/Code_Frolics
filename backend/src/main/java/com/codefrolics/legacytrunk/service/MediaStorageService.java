package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.model.StoredMedia;
import com.codefrolics.legacytrunk.repository.StoredMediaRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaStorageService {

    private final StoredMediaRepository storedMediaRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        try {
            this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.fileStorageLocation);
            log.info("Local upload cache initialized at {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.warn("Could not create local disk upload directory: {}. Database storage will be used.", ex.getMessage());
        }
    }

    @Transactional
    public String storeFile(MultipartFile file, String prefix) {
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
        );
        String fileExtension = "";

        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String newFilename = prefix + "_" + UUID.randomUUID().toString() + fileExtension;

        try {
            byte[] fileBytes = file.getBytes();
            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            // 1. Store in Neon PostgreSQL database for global persistence across any host
            StoredMedia media = StoredMedia.builder()
                    .fileName(newFilename)
                    .originalFilename(originalFilename)
                    .contentType(contentType)
                    .fileSize(file.getSize())
                    .data(fileBytes)
                    .build();

            storedMediaRepository.save(media);
            log.info("Saved media {} ({} bytes) to database", newFilename, fileBytes.length);

            // 2. Optionally write to local disk cache if available
            if (this.fileStorageLocation != null) {
                try {
                    Path targetLocation = this.fileStorageLocation.resolve(newFilename);
                    Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                } catch (Exception diskEx) {
                    log.debug("Local disk cache write skipped: {}", diskEx.getMessage());
                }
            }

            return newFilename;
        } catch (IOException ex) {
            log.error("Failed to read upload file bytes for {}", newFilename, ex);
            throw new RuntimeException("Could not store file " + newFilename + ". Please try again!", ex);
        }
    }

    @Transactional(readOnly = true)
    public Optional<StoredMedia> getStoredMedia(String fileName) {
        return storedMediaRepository.findById(fileName);
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(String fileName) {
        // 1. First check database
        Optional<StoredMedia> mediaOpt = storedMediaRepository.findById(fileName);
        if (mediaOpt.isPresent()) {
            StoredMedia media = mediaOpt.get();
            return new ByteArrayResource(media.getData()) {
                @Override
                public String getFilename() {
                    return media.getFileName();
                }
            };
        }

        // 2. Fallback to local disk if migrating from previous local uploads
        if (this.fileStorageLocation != null) {
            try {
                Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
                Resource resource = new UrlResource(filePath.toUri());
                if (resource.exists()) {
                    return resource;
                }
            } catch (MalformedURLException ex) {
                log.debug("Malformed URL for local file {}", fileName, ex);
            }
        }

        throw new RuntimeException("File not found " + fileName);
    }

    @Transactional
    public void deleteFile(String fileName) {
        storedMediaRepository.deleteById(fileName);
        if (this.fileStorageLocation != null) {
            try {
                Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException ex) {
                log.warn("Could not delete cached local file: {}", fileName);
            }
        }
    }
}
