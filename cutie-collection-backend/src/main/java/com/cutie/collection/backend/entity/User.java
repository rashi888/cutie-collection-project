package com.cutie.collection.backend.entity;

import java.time.LocalDateTime;
import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            length = 100)
    private String name;

    @Column(
            nullable = false,
            unique = true,
            length = 150)
    private String email;

    /*
     * Prevents the password hash from appearing in JSON responses.
     * API controllers should still return DTOs instead of User entities.
     */
    @JsonIgnore
    @Column(
            nullable = false,
            length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20)
    private Role role = Role.CUSTOMER;

    @Column(
            nullable = false)
    private boolean active = true;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false)
    private LocalDateTime updatedAt;

    protected User() {
    }

    public User(
            String name,
            String email,
            String password) {

        setName(name);
        setEmail(email);
        setPassword(password);
        this.role = Role.CUSTOMER;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        normalizeData();

        if (this.role == null) {
            this.role = Role.CUSTOMER;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        this.updatedAt = LocalDateTime.now();

        normalizeData();
    }

    private void normalizeData() {

        if (name != null) {
            name = name.trim();
        }

        if (email != null) {
            email = email
                    .trim()
                    .toLowerCase(Locale.ROOT);
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setName(String name) {

        this.name = name == null
                ? null
                : name.trim();
    }

    public void setEmail(String email) {

        this.email = email == null
                ? null
                : email.trim().toLowerCase(Locale.ROOT);
    }

    /*
     * The AuthService must pass an already encoded BCrypt password.
     * Do not pass a raw password directly to this setter.
     */
    public void setPassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void setRole(Role role) {

        if (role == null) {
            throw new IllegalArgumentException(
                    "User role cannot be null");
        }

        this.role = role;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public String toString() {

        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", active=" + active +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}