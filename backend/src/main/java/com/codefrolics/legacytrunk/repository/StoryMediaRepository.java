package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.StoryMedia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StoryMediaRepository extends JpaRepository<StoryMedia, Long> {

    /**
     * Returns all media files accessible to a user (own stories + stories shared with them),
     * optionally filtered by a MIME-type prefix (e.g. "image", "video", "audio").
     * Ordered by story creation date descending so newest media appears first.
     */
    @Query("""
        SELECT m FROM StoryMedia m
        JOIN m.story s
        WHERE (s.user.id = :userId OR EXISTS (
            SELECT sh FROM StoryShare sh
            WHERE sh.story = s AND sh.sharedWithUser.id = :userId
        ))
        AND (:mediaTypePrefix IS NULL OR m.mediaType LIKE CONCAT(:mediaTypePrefix, '%'))
        ORDER BY s.createdAt DESC
        """)
    Page<StoryMedia> findAccessibleMedia(
            @Param("userId") Long userId,
            @Param("mediaTypePrefix") String mediaTypePrefix,
            Pageable pageable
    );
}
