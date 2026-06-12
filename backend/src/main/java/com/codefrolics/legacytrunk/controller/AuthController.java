package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

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
}
