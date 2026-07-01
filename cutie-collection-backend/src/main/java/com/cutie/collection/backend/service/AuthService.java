package com.cutie.collection.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cutie.collection.backend.dto.AuthResponse;
import com.cutie.collection.backend.dto.LoginRequest;
import com.cutie.collection.backend.dto.SignupRequest;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.util.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse signup(
            SignupRequest request) {

        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole("USER");
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        userRepository.save(user);

        String token =
                jwtUtil.generateToken(
                        user.getEmail());

        return new AuthResponse(
                token,
                user.getName(),
                "User registered successfully",
                user.getRole());
    }

    public AuthResponse login(
            LoginRequest request) {

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid credentials"));

        boolean matches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword());

        if (!matches) {
            throw new RuntimeException(
                    "Invalid credentials");
        }

        String token =
                jwtUtil.generateToken(
                        user.getEmail());

        return new AuthResponse(
                token,
                user.getName(),
                "Login successful",
                user.getRole());
    }
}