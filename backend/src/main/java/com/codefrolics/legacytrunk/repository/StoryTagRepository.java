package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.StoryTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoryTagRepository extends JpaRepository<StoryTag, Long> {
    List<StoryTag> findByTagContainingIgnoreCase(String tag);
}
