package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Recipe> findByFamilyMemberIdOrderByCreatedAtDesc(Long familyMemberId);
}
