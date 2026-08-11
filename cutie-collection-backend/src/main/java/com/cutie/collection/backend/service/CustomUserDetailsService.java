package com.cutie.collection.backend.service;

import java.util.Locale;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.repository.UserRepository;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(
            String email)
            throws UsernameNotFoundException {

        String normalizedEmail =
                normalizeEmail(email);

        com.cutie.collection.backend.entity.User user =
                userRepository
                        .findByEmailIgnoreCaseAndActiveTrue(
                                normalizedEmail)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "Invalid email or password"));

        String authority =
                "ROLE_" + user.getRole().name();

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(authority)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.isActive())
                .build();
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