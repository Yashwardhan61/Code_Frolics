package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "story_shares", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"story_id", "shared_with_user_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoryShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_user_id", nullable = false)
    private User sharedWithUser;

    @Column(name = "shared_at")
    @Builder.Default
    private LocalDateTime sharedAt = LocalDateTime.now();
}
