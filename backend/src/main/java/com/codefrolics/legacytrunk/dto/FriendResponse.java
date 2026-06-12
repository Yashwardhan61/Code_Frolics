package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendResponse {
    private Long id;          // Friendship or Invitation ID
    private Long userId;      // The other user's ID
    private String email;
    private String displayName;
    private String username;
    private String photoUrl;
    private String status;    // For invitations: pending, accepted, declined. For friends: active
}
