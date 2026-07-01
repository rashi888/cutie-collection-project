package com.cutie.collection.backend.service;

import com.cutie.collection.backend.dto.AuthResponse;
import com.cutie.collection.backend.dto.LoginRequest;
import com.cutie.collection.backend.dto.SignupRequest;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;

    @InjectMocks AuthService authService;

    @Test
    void signup_success() {
        SignupRequest req = new SignupRequest();
        req.setName("Rashi");
        req.setEmail("rashi@example.com");
        req.setPassword("secret123");

        when(userRepository.existsByEmail("rashi@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateToken("rashi@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.signup(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getName()).isEqualTo("Rashi");
        assertThat(response.getRole()).isEqualTo("USER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signup_emailAlreadyExists_throwsException() {
        SignupRequest req = new SignupRequest();
        req.setName("Rashi");
        req.setEmail("taken@example.com");
        req.setPassword("secret123");

        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("rashi@example.com");
        req.setPassword("secret123");

        User user = new User("Rashi", "rashi@example.com", "hashed");
        user.setRole("USER");

        when(userRepository.findByEmail("rashi@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("rashi@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getName()).isEqualTo("Rashi");
    }

    @Test
    void login_invalidEmail_throwsException() {
        LoginRequest req = new LoginRequest();
        req.setEmail("nobody@example.com");
        req.setPassword("pass");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_wrongPassword_throwsException() {
        LoginRequest req = new LoginRequest();
        req.setEmail("rashi@example.com");
        req.setPassword("wrong");

        User user = new User("Rashi", "rashi@example.com", "hashed");

        when(userRepository.findByEmail("rashi@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");
    }
}