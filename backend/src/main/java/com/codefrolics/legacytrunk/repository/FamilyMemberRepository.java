package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByUserIdAndTreeTypeOrderByCreatedAtAsc(Long userId, String treeType);
}
