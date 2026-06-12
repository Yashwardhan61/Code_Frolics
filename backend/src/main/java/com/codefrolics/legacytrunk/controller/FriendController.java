package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.FriendResponse;
import com.codefrolics.legacytrunk.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ResponseEntity<List<FriendResponse>> getFriends() {
        return ResponseEntity.ok(friendService.getFriends());
    }

    @GetMapping("/invitations")
    public ResponseEntity<List<FriendResponse>> getPendingInvitations() {
        return ResponseEntity.ok(friendService.getPendingInvitations());
    }

    @PostMapping("/invite")
    public ResponseEntity<?> sendInvitation(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        try {
            friendService.sendInvitation(email);
            return ResponseEntity.ok(Map.of("message", "Invitation sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/accept/{invitationId}")
    public ResponseEntity<?> acceptInvitation(@PathVariable Long invitationId) {
        try {
            friendService.acceptInvitation(invitationId);
            return ResponseEntity.ok(Map.of("message", "Invitation accepted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/decline/{invitationId}")
    public ResponseEntity<?> declineInvitation(@PathVariable Long invitationId) {
        try {
            friendService.declineInvitation(invitationId);
            return ResponseEntity.ok(Map.of("message", "Invitation declined"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<?> removeFriend(@PathVariable Long friendId) {
        try {
            friendService.removeFriend(friendId);
            return ResponseEntity.ok(Map.of("message", "Friend removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
