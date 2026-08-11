package com.cutie.collection.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.UserResponse;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.service.CurrentUserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final CurrentUserService currentUserService;

    public UserController(
            CurrentUserService currentUserService) {

        this.currentUserService = currentUserService;
    }

    /**
     * Returns the currently authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication) {

        User user =
                currentUserService.getCurrentUser(
                        authentication);

        UserResponse response =
                mapToResponse(user);

        return ResponseEntity.ok(response);
    }

    private UserResponse mapToResponse(
            User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}