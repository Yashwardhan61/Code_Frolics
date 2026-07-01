package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Story;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface StoryRepositoryCustom {
    Page<Story> searchStories(
        Long currentUserId,
        String query,
        LocalDate startDate,
        LocalDate endDate,
        Long authorId,
        String mediaType,
        List<String> tags,
        String location,
        String sort,
        Pageable pageable
    );
}
