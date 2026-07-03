package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.service.EmailService;
import com.codefrolics.legacytrunk.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final EmailService emailService;

    // This endpoint acts as a trigger to ensure the Firebase token filter has synced the user
    @PostMapping("/sync")
    public ResponseEntity<?> syncUser() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(Map.of("message", "User synced successfully", "userId", user.getId()));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    // Public endpoint — no Firebase auth required
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        try {
            emailService.sendPasswordResetEmail(email.trim().toLowerCase());
            return ResponseEntity.ok(Map.of("message", "Password reset email sent. Check your inbox."));
        } catch (RuntimeException e) {
            log.warn("Forgot password failed for {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Public endpoint — validates token and returns associated email without consuming it
    @PostMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is required."));
        }
        try {
            String email = emailService.checkResetToken(token.trim());
            return ResponseEntity.ok(Map.of("email", email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Public endpoint — resets the user's password using the validated token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is required."));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters."));
        }
        try {
            emailService.resetPassword(token.trim(), newPassword);
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
        } catch (RuntimeException e) {
            log.error("Password reset failed for token {}: {}", token, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
