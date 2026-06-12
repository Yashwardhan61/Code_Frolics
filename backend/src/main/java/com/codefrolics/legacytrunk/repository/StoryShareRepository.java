package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.StoryShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoryShareRepository extends JpaRepository<StoryShare, Long> {
    List<StoryShare> findByStoryId(Long storyId);
    void deleteByStoryIdAndSharedWithUserId(Long storyId, Long sharedWithUserId);
}
