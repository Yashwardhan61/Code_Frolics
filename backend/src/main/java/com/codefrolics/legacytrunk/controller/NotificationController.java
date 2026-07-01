package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.NotificationResponse;
import com.codefrolics.legacytrunk.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final com.codefrolics.legacytrunk.service.EmailService emailService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        return ResponseEntity.ok(notificationService.getNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    // Temporary test endpoint for SMTP
    @GetMapping("/test-email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestParam String email) {
        emailService.sendNotificationEmail(
            email, 
            "Test Email Works!", 
            "If you are reading this, your SMTP configuration is successfully working.", 
            "/"
        );
        return ResponseEntity.ok(Map.of("message", "Test email queued for: " + email));
    }
}
