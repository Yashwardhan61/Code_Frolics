package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT s FROM Story s JOIN s.shares sh WHERE sh.sharedWithUser.id = :userId ORDER BY s.createdAt DESC")
    List<Story> findSharedWithUserOrderByCreatedAtDesc(Long userId);
}
