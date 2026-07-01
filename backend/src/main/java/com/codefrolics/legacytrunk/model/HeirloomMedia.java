package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "heirloom_media")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HeirloomMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heirloom_id", nullable = false)
    private Heirloom heirloom;

    @Column(name = "file_path", nullable = false, length = 1000)
    private String filePath;

    @Column(name = "media_type", nullable = false, length = 50)
    private String mediaType;

    @Column(name = "original_filename", length = 500)
    private String originalFilename;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
