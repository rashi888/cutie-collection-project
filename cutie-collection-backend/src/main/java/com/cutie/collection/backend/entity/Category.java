package com.cutie.collection.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            unique = true,
            length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
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

    protected Category() {
    }

    public Category(
            String name,
            String description) {

        setName(name);
        setDescription(description);
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {

        normalizeData();

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        normalizeData();

        updatedAt = LocalDateTime.now();
    }

    private void normalizeData() {

        if (name != null) {
            name = name.trim();
        }

        if (description != null) {

            description = description.trim();

            if (description.isEmpty()) {
                description = null;
            }
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
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

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Category name cannot be blank");
        }

        String normalizedName = name.trim();

        if (normalizedName.length() > 100) {
            throw new IllegalArgumentException(
                    "Category name cannot exceed 100 characters");
        }

        this.name = normalizedName;
    }

    public void setDescription(String description) {

        if (description == null) {
            this.description = null;
            return;
        }

        String normalizedDescription = description.trim();

        if (normalizedDescription.length() > 500) {
            throw new IllegalArgumentException(
                    "Category description cannot exceed 500 characters");
        }

        this.description = normalizedDescription.isEmpty()
                ? null
                : normalizedDescription;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }
}