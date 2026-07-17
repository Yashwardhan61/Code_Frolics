package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsRead(Long userId);

    boolean existsByUserIdAndStoryIdAndType(Long userId, Long storyId, String type);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.story.id = :storyId")
    void deleteByStoryId(@Param("storyId") Long storyId);
}
