package com.codefrolics.legacytrunk.repository;

import com.codefrolics.legacytrunk.model.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {
    List<Friend> findByUserId(Long userId);
    Optional<Friend> findByUserIdAndFriendUserId(Long userId, Long friendUserId);
}
