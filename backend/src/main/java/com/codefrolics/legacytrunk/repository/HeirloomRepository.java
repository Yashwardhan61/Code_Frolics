package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Heirloom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeirloomRepository extends JpaRepository<Heirloom, Long> {
    List<Heirloom> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Heirloom> findByFamilyMemberIdOrderByCreatedAtDesc(Long familyMemberId);
}
