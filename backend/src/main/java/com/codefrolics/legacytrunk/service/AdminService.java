package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.UserRoleResponse;
import com.codefrolics.legacytrunk.model.Role;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<UserRoleResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserRoleResponse updateUserRole(Long userId, String roleName) {
        User currentUser = userService.getCurrentUser();

        // Verify current user is ADMIN
        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admins can change roles");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role newRole = Role.valueOf(roleName.toUpperCase());

        // Prevent demoting the last ADMIN
        if (targetUser.getRole() == Role.ADMIN && newRole != Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot demote the last admin. Promote another user first.");
            }
        }

        targetUser.setRole(newRole);
        userRepository.save(targetUser);
        log.info("User {} role changed to {} by admin {}", targetUser.getEmail(), newRole, currentUser.getEmail());

        return toResponse(targetUser);
    }

    private UserRoleResponse toResponse(User user) {
        return UserRoleResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .username(user.getUsername())
                .photoUrl(user.getPhotoUrl())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
