package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "heirloom_tags")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HeirloomTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heirloom_id", nullable = false)
    private Heirloom heirloom;

    @Column(nullable = false, length = 100)
    private String tag;
}
