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
public class ProfileResponse {
    private Long id;
    private String email;
    private String displayName;
    private String username;
    private String description;
    private String photoUrl;
    private Boolean hasChangedUsername;
    private Boolean profileSetupComplete;
    private LocalDateTime createdAt;
    
    // Stats
    private long storyCount;
    private long friendCount;
    private long familyMemberCount;
}
