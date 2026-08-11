package com.cutie.collection.backend.service;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.UserRepository;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                        authentication.getPrincipal())) {

            throw new AuthenticationCredentialsNotFoundException(
                    "Authentication is required");
        }

        return userRepository
                .findByEmailIgnoreCaseAndActiveTrue(
                        authentication.getName())
                .orElseThrow(() ->
                        new AuthenticationCredentialsNotFoundException(
                                "Authenticated user was not found"));
    }

    @Transactional(readOnly = true)
    public Long getCurrentUserId(
            Authentication authentication) {

        return getCurrentUser(authentication)
                .getId();
    }
}