package com.codefrolics.legacytrunk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 10000, message = "Description must not exceed 10000 characters")
    private String description;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    private LocalDate storyDate;
    private List<String> tags;
    private List<Long> sharedWithUserIds;
    private Long familyMemberId;
    private LocalDateTime unlockDateTime;
}
