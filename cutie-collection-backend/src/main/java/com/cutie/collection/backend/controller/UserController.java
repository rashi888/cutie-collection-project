package com.cutie.collection.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.UserResponse;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public UserResponse me(
            Authentication authentication) {

        User user =
                userRepository
                        .findByEmail(
                                authentication.getName())
                        .orElseThrow();

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());
    }
}