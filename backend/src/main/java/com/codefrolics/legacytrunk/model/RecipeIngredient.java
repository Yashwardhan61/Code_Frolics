package com.codefrolics.legacytrunk.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipe_ingredients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 100)
    private String quantity;

    @Column(length = 50)
    private String unit;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
