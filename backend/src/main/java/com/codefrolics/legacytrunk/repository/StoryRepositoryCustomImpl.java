package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Story;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class StoryRepositoryCustomImpl implements StoryRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Story> searchStories(
            Long currentUserId,
            String query,
            LocalDate startDate,
            LocalDate endDate,
            Long authorId,
            String mediaType,
            List<String> tags,
            String location,
            String sort,
            Pageable pageable) {

        StringBuilder selectSql = new StringBuilder("SELECT DISTINCT s.* FROM stories s ");
        StringBuilder countSql = new StringBuilder("SELECT COUNT(DISTINCT s.id) FROM stories s ");

        StringBuilder joins = new StringBuilder();
        joins.append("LEFT JOIN users u ON s.user_id = u.id ");
        joins.append("LEFT JOIN story_tags t ON s.id = t.story_id ");

        StringBuilder where = new StringBuilder();
        where.append("WHERE (s.user_id = :currentUserId OR s.id IN (SELECT sh.story_id FROM story_shares sh WHERE sh.shared_with_user_id = :currentUserId)) ");

        Map<String, Object> params = new HashMap<>();
        params.put("currentUserId", currentUserId);

        if (query != null && !query.trim().isEmpty()) {
            String trimmedQuery = query.trim();
            where.append("AND (");
            where.append("to_tsvector('english', coalesce(s.title, '') || ' ' || coalesce(s.description, '') || ' ' || coalesce(s.location, '') || ' ' || coalesce(u.display_name, '') || ' ' || coalesce(t.tag, '')) @@ websearch_to_tsquery('english', :ftsQuery) ");
            where.append("OR LOWER(s.title) LIKE LOWER(:likeQuery) ");
            where.append("OR LOWER(s.description) LIKE LOWER(:likeQuery) ");
            where.append("OR LOWER(s.location) LIKE LOWER(:likeQuery) ");
            where.append("OR LOWER(u.display_name) LIKE LOWER(:likeQuery) ");
            where.append("OR LOWER(t.tag) LIKE LOWER(:likeQuery) ");
            where.append(") ");
            params.put("ftsQuery", trimmedQuery);
            params.put("likeQuery", "%" + trimmedQuery + "%");
        }

        if (startDate != null) {
            where.append("AND s.story_date >= :startDate ");
            params.put("startDate", startDate);
        }

        if (endDate != null) {
            where.append("AND s.story_date <= :endDate ");
            params.put("endDate", endDate);
        }

        if (authorId != null) {
            where.append("AND s.user_id = :authorId ");
            params.put("authorId", authorId);
        }

        if (mediaType != null && !mediaType.trim().isEmpty()) {
            if ("Photos".equalsIgnoreCase(mediaType)) {
                where.append("AND s.id IN (SELECT sm.story_id FROM story_media sm WHERE sm.media_type LIKE 'image/%') ");
            } else if ("Videos".equalsIgnoreCase(mediaType)) {
                where.append("AND s.id IN (SELECT sm.story_id FROM story_media sm WHERE sm.media_type LIKE 'video/%') ");
            } else if ("Audio".equalsIgnoreCase(mediaType)) {
                where.append("AND s.id IN (SELECT sm.story_id FROM story_media sm WHERE sm.media_type LIKE 'audio/%' OR sm.file_path LIKE '%.webm' OR sm.file_path LIKE '%.wav' OR sm.file_path LIKE '%.mp3') ");
            } else if ("Text".equalsIgnoreCase(mediaType)) {
                where.append("AND NOT EXISTS (SELECT 1 FROM story_media sm WHERE sm.story_id = s.id) ");
            }
        }

        if (tags != null && !tags.isEmpty()) {
            where.append("AND s.id IN (SELECT st.story_id FROM story_tags st WHERE LOWER(st.tag) IN (:tags)) ");
            params.put("tags", tags.stream().map(String::toLowerCase).collect(Collectors.toList()));
        }

        if (location != null && !location.trim().isEmpty()) {
            where.append("AND LOWER(s.location) LIKE LOWER(:locationFilter) ");
            params.put("locationFilter", "%" + location.trim() + "%");
        }

        // 1. Get Count
        String fullCountQuery = countSql.toString() + joins.toString() + where.toString();
        Query countQueryObj = entityManager.createNativeQuery(fullCountQuery);
        params.forEach(countQueryObj::setParameter);
        long totalElements = ((Number) countQueryObj.getSingleResult()).longValue();

        if (totalElements == 0) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // 2. Add Sort and execute main query
        String orderBy = " ORDER BY s.story_date DESC, s.created_at DESC"; // default
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "oldest":
                    orderBy = " ORDER BY s.story_date ASC, s.created_at ASC";
                    break;
                case "views":
                    orderBy = " ORDER BY coalesce(s.views, 0) DESC, s.story_date DESC";
                    break;
                case "recent":
                    orderBy = " ORDER BY s.created_at DESC";
                    break;
                case "newest":
                default:
                    orderBy = " ORDER BY s.story_date DESC, s.created_at DESC";
                    break;
            }
        }

        String fullSelectQuery = selectSql.toString() + joins.toString() + where.toString() + orderBy;
        Query selectQueryObj = entityManager.createNativeQuery(fullSelectQuery, Story.class);
        params.forEach(selectQueryObj::setParameter);

        // Apply pagination
        selectQueryObj.setFirstResult((int) pageable.getOffset());
        selectQueryObj.setMaxResults(pageable.getPageSize());

        @SuppressWarnings("unchecked")
        List<Story> stories = selectQueryObj.getResultList();

        return new PageImpl<>(stories, pageable, totalElements);
    }
}
