package com.codefrolics.legacytrunk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeirloomRequest {
    private String name;
    private String description;
    private String currentOwner;
    private String nextOwner;
    private String estimatedYear;
    private Long familyMemberId;
    private List<String> tags;
}
