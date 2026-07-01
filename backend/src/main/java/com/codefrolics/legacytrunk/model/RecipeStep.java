package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipe_steps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecipeStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String instruction;
}
