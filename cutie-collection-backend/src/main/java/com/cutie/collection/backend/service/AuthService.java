package com.cutie.collection.backend.service;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.AuthResponse;
import com.cutie.collection.backend.dto.LoginRequest;
import com.cutie.collection.backend.dto.SignupRequest;
import com.cutie.collection.backend.entity.Role;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.exception.ConflictException;
import com.cutie.collection.backend.exception.UnauthorizedOperationException;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.util.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final long jwtExpirationMs;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            @Value("${application.jwt.expiration-ms}")
            long jwtExpirationMs) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {

        String normalizedEmail =
                normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(
                normalizedEmail)) {

            throw new ConflictException(
                    "An account already exists with this email");
        }

        String encodedPassword =
                passwordEncoder.encode(
                        request.getPassword());

        User user = new User(
                request.getName(),
                normalizedEmail,
                encodedPassword
        );

        /*
         * Never take the role from the signup request.
         * Every public signup creates a CUSTOMER.
         */
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        User savedUser =
                userRepository.save(user);

        String accessToken =
                jwtUtil.generateToken(
                        savedUser.getEmail());

        return createAuthResponse(
                savedUser,
                accessToken,
                "User registered successfully"
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String normalizedEmail =
                normalizeEmail(request.getEmail());

        /*
         * The same generic message is returned when the email does not
         * exist, the account is inactive, or the password is incorrect.
         * This prevents account-enumeration information leakage.
         */
        User user = userRepository
                .findByEmailIgnoreCaseAndActiveTrue(
                        normalizedEmail)
                .orElseThrow(() ->
                        new UnauthorizedOperationException(
                                "Invalid email or password"));

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword());

        if (!passwordMatches) {
            throw new UnauthorizedOperationException(
                    "Invalid email or password");
        }

        String accessToken =
                jwtUtil.generateToken(
                        user.getEmail());

        return createAuthResponse(
                user,
                accessToken,
                "Login successful"
        );
    }

    private AuthResponse createAuthResponse(
            User user,
            String accessToken,
            String message) {

        long expirationInSeconds =
                jwtExpirationMs / 1000;

        return new AuthResponse(
                accessToken,
                expirationInSeconds,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                message
        );
    }

    private String normalizeEmail(String email) {

        if (email == null) {
            return null;
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}