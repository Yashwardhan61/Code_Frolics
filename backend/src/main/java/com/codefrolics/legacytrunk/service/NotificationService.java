package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.NotificationResponse;
import com.codefrolics.legacytrunk.model.Notification;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications() {
        User currentUser = userService.getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = userService.getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(currentUser.getId());
    }

    @Transactional
    public void markAsRead(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = userService.getCurrentUser();
        notificationRepository.markAllAsRead(currentUser.getId());
    }

    @Transactional
    public void deleteNotification(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notificationRepository.delete(notification);
    }

    @Transactional
    public void createNotification(User user, String type, String title, String message, com.codefrolics.legacytrunk.model.Story story, String actionUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .story(story)
                .actionUrl(actionUrl)
                .build();
        notificationRepository.save(notification);

        // Send email alert
        emailService.sendNotificationEmail(user.getEmail(), title, message, actionUrl);
    }

    @Transactional
    public void deleteNotificationsByStoryId(Long storyId) {
        notificationRepository.deleteByStoryId(storyId);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .storyId(notification.getStory() != null ? notification.getStory().getId() : null)
                .actionUrl(notification.getActionUrl())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
