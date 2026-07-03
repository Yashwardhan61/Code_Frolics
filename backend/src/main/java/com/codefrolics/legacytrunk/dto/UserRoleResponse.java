package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleResponse {
    private Long id;
    private String email;
    private String displayName;
    private String username;
    private String photoUrl;
    private String role;
    private LocalDateTime createdAt;
}
