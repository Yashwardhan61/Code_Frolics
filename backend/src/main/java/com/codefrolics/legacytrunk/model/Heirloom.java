package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "heirlooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Heirloom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_member_id")
    private FamilyMember familyMember;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "current_owner", length = 255)
    private String currentOwner;

    @Column(name = "next_owner", length = 255)
    private String nextOwner;

    @Column(name = "estimated_year", length = 50)
    private String estimatedYear;

    @OneToMany(mappedBy = "heirloom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HeirloomMedia> mediaFiles = new ArrayList<>();

    @OneToMany(mappedBy = "heirloom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HeirloomTag> tags = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
