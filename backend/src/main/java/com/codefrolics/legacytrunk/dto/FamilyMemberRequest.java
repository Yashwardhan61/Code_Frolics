package com.codefrolics.legacytrunk.dto;

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
    private String name;
    private String relationship;
    private LocalDate birthDate;
    private LocalDate deathDate;
    private String birthPlace;
    private String bio;
    private Long parentMemberId;
}
