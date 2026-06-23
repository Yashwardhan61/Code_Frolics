package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryRequest {
    private String title;
    private String description;
    private String location;
    private LocalDate storyDate;
    private List<String> tags;
    private List<Long> sharedWithUserIds;
    private Long familyMemberId;
}
