package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.FriendInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendInvitationRepository extends JpaRepository<FriendInvitation, Long> {
    List<FriendInvitation> findByToUserIdAndStatusOrderByCreatedAtDesc(Long toUserId, String status);
    Optional<FriendInvitation> findByFromUserIdAndToUserId(Long fromUserId, Long toUserId);
}
