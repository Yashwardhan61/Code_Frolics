package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "story_tags")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoryTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(nullable = false, length = 100)
    private String tag;
}
