package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.dto.FriendResponse;
import com.codefrolics.legacytrunk.model.Friend;
import com.codefrolics.legacytrunk.model.FriendInvitation;
import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.FriendInvitationRepository;
import com.codefrolics.legacytrunk.repository.FriendRepository;
import com.codefrolics.legacytrunk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final FriendInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<FriendResponse> getFriends() {
        User currentUser = userService.getCurrentUser();
        return friendRepository.findByUserId(currentUser.getId()).stream()
                .map(f -> mapToFriendResponse(f))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendResponse> getPendingInvitations() {
        User currentUser = userService.getCurrentUser();
        return invitationRepository.findByToUserIdAndStatusOrderByCreatedAtDesc(currentUser.getId(), "pending").stream()
                .map(this::mapToInvitationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void sendInvitation(String email) {
        User currentUser = userService.getCurrentUser();
        
        if (currentUser.getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Cannot invite yourself");
        }
        
        User toUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        // Check if already friends
        if (friendRepository.findByUserIdAndFriendUserId(currentUser.getId(), toUser.getId()).isPresent()) {
            throw new RuntimeException("Already friends");
        }
        
        // Check if invitation already exists
        Optional<FriendInvitation> existing = invitationRepository.findByFromUserIdAndToUserId(currentUser.getId(), toUser.getId());
        if (existing.isPresent() && existing.get().getStatus().equals("pending")) {
            throw new RuntimeException("Invitation already sent");
        }
        
        FriendInvitation invitation = FriendInvitation.builder()
                .fromUser(currentUser)
                .toUser(toUser)
                .status("pending")
                .build();
                
        invitationRepository.save(invitation);

        notificationService.createNotification(
                toUser,
                "friend_request",
                "New friend request",
                currentUser.getDisplayName() + " sent you a friend request.",
                null,
                "/friends"
        );
    }

    @Transactional
    public void acceptInvitation(Long invitationId) {
        User currentUser = userService.getCurrentUser();
        
        FriendInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
                
        if (!invitation.getToUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (!"pending".equals(invitation.getStatus())) {
            throw new RuntimeException("Invitation already processed");
        }
        
        invitation.setStatus("accepted");
        invitationRepository.save(invitation);
        
        // Create bidirectional friend records
        Friend friend1 = Friend.builder().user(currentUser).friendUser(invitation.getFromUser()).build();
        Friend friend2 = Friend.builder().user(invitation.getFromUser()).friendUser(currentUser).build();
        
        friendRepository.save(friend1);
        friendRepository.save(friend2);

        notificationService.createNotification(
                invitation.getFromUser(),
                "friend_accepted",
                "Friend request accepted",
                currentUser.getDisplayName() + " accepted your friend request.",
                null,
                "/friends"
        );
    }

    @Transactional
    public void declineInvitation(Long invitationId) {
        User currentUser = userService.getCurrentUser();
        
        FriendInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
                
        if (!invitation.getToUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        invitation.setStatus("declined");
        invitationRepository.save(invitation);
    }
    
    @Transactional
    public void removeFriend(Long friendUserId) {
        User currentUser = userService.getCurrentUser();
        
        Friend f1 = friendRepository.findByUserIdAndFriendUserId(currentUser.getId(), friendUserId)
                .orElseThrow(() -> new RuntimeException("Friend not found"));
                
        Friend f2 = friendRepository.findByUserIdAndFriendUserId(friendUserId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Friend not found"));
                
        friendRepository.delete(f1);
        friendRepository.delete(f2);
    }

    private FriendResponse mapToFriendResponse(Friend friend) {
        User friendUser = friend.getFriendUser();
        return FriendResponse.builder()
                .id(friend.getId())
                .userId(friendUser.getId())
                .email(friendUser.getEmail())
                .displayName(friendUser.getDisplayName())
                .username(friendUser.getUsername())
                .photoUrl(friendUser.getPhotoUrl())
                .status("active")
                .build();
    }
    
    private FriendResponse mapToInvitationResponse(FriendInvitation inv) {
        User fromUser = inv.getFromUser();
        return FriendResponse.builder()
                .id(inv.getId())
                .userId(fromUser.getId())
                .email(fromUser.getEmail())
                .displayName(fromUser.getDisplayName())
                .username(fromUser.getUsername())
                .photoUrl(fromUser.getPhotoUrl())
                .status(inv.getStatus())
                .build();
    }
}
