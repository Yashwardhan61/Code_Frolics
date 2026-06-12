package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.UserRepository;
import com.codefrolics.legacytrunk.security.FirebaseUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof FirebaseUserDetails) {
            FirebaseUserDetails userDetails = (FirebaseUserDetails) authentication.getPrincipal();
            // Fetch fresh from DB to ensure we have latest fields
            return userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("Unauthorized");
    }
}
