package com.codefrolics.legacytrunk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Relationship is required")
    @Size(max = 100, message = "Relationship must not exceed 100 characters")
    private String relationship;

    private LocalDate birthDate;
    private LocalDate deathDate;

    @Size(max = 255, message = "Birth place must not exceed 255 characters")
    private String birthPlace;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    private Long parentMemberId;
}
