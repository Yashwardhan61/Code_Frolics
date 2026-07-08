package com.codefrolics.legacytrunk.security;

import com.codefrolics.legacytrunk.model.User;
import com.codefrolics.legacytrunk.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = getBearerToken(request);
            if (StringUtils.hasText(token)) {
                String parsedUid = null;
                String parsedEmail = null;
                String parsedName = null;

                try {
                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                    parsedUid = decodedToken.getUid();
                    parsedEmail = decodedToken.getEmail();
                    parsedName = decodedToken.getName();
                } catch (IllegalStateException e) {
                    // Fallback to unsafe manual JWT decoding if Firebase Admin is not initialized
                    log.warn("Firebase Admin not initialized! Using unsafe manual token decoding for local dev.");
                    String[] parts = token.split("\\.");
                    if (parts.length == 3) {
                        String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                        com.fasterxml.jackson.databind.JsonNode json = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payload);
                        parsedUid = json.has("user_id") ? json.get("user_id").asText() : json.get("sub").asText();
                        parsedEmail = json.has("email") ? json.get("email").asText() : "dummy@example.com";
                        parsedName = json.has("name") ? json.get("name").asText() : 
                                     json.has("displayName") ? json.get("displayName").asText() : 
                                     json.has("display_name") ? json.get("display_name").asText() : null;
                    } else {
                        throw new IllegalArgumentException("Invalid JWT format");
                    }
                }

                // Make effectively final for lambda
                final String uid = parsedUid;
                final String email = parsedEmail;
                final String name = parsedName;

                // Find user in local DB, or create if first time (sync from Firebase)
                User user;
                try {
                    user = userRepository.findByFirebaseUid(uid).orElseGet(() -> {
                        // Check if a user with this email already exists (e.g. UID changed or race condition)
                        return userRepository.findByEmail(email).map(existingUser -> {
                            log.info("Found existing user by email {}, updating firebaseUid", email);
                            existingUser.setFirebaseUid(uid);
                            if (name != null && existingUser.getDisplayName() == null) {
                                existingUser.setDisplayName(name);
                            }
                            return userRepository.save(existingUser);
                        }).orElseGet(() -> {
                            log.info("Creating new user from Firebase token: {}", email);
                            com.codefrolics.legacytrunk.model.Role assignedRole = 
                                userRepository.count() == 0 ? com.codefrolics.legacytrunk.model.Role.ADMIN : com.codefrolics.legacytrunk.model.Role.MEMBER;
                            User newUser = User.builder()
                                    .firebaseUid(uid)
                                    .email(email)
                                    .displayName(name)
                                    .role(assignedRole)
                                    .build();
                            log.info("Assigned role {} to new user {}", assignedRole, email);
                            return userRepository.save(newUser);
                        });
                    });
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    // Race condition: another request already inserted this user. Just look them up.
                    log.warn("Duplicate key during user creation for {}, recovering by lookup", email);
                    user = userRepository.findByEmail(email)
                            .orElseGet(() -> userRepository.findByFirebaseUid(uid)
                            .orElseThrow(() -> new RuntimeException("User not found after duplicate key recovery")));
                }

                FirebaseUserDetails userDetails = new FirebaseUserDetails(user);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (FirebaseAuthException e) {
            log.error("Firebase Auth Exception: {}", e.getMessage(), e);
            // SecurityContextHolder will be empty, Spring Security will reject requests requiring auth
        } catch (Exception e) {
            log.error("Internal server error during auth filter: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String getBearerToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
