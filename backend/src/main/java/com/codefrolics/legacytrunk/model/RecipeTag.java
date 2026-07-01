package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipe_tags")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecipeTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false, length = 100)
    private String tag;
}
