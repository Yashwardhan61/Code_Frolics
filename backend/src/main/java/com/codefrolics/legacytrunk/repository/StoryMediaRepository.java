package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.StoryMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoryMediaRepository extends JpaRepository<StoryMedia, Long> {
}
