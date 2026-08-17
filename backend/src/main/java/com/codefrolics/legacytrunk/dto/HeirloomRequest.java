package com.codefrolics.legacytrunk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Heirloom name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 10000, message = "Description must not exceed 10000 characters")
    private String description;

    @Size(max = 255, message = "Current owner must not exceed 255 characters")
    private String currentOwner;

    @Size(max = 255, message = "Next owner must not exceed 255 characters")
    private String nextOwner;

    @Size(max = 50, message = "Estimated year must not exceed 50 characters")
    private String estimatedYear;

    private Long familyMemberId;
    private List<String> tags;
}
