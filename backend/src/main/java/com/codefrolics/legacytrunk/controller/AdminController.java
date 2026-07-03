package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.dto.UserRoleResponse;
import com.codefrolics.legacytrunk.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserRoleResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserRoleResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }
}
