package com.cutie.collection.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_review_user_product",
                        columnNames = {
                                "user_id",
                                "product_id"
                        }
                )
        }
)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false)
    private Integer rating;

    @Column(
            length = 1000)
    private String comment;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false)
    private User user;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false)
    private Product product;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false)
    private LocalDateTime updatedAt;

    protected Review() {
    }

    public Review(
            Integer rating,
            String comment,
            User user,
            Product product) {

        setRating(rating);
        setComment(comment);
        setUser(user);
        setProduct(product);
    }

    @PrePersist
    protected void onCreate() {

        validateRating();

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        validateRating();

        this.updatedAt = LocalDateTime.now();
    }

    private void validateRating() {

        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalStateException(
                    "Review rating must be between 1 and 5");
        }
    }

    public Long getId() {
        return id;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public User getUser() {
        return user;
    }

    public Product getProduct() {
        return product;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setRating(Integer rating) {

        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException(
                    "Review rating must be between 1 and 5");
        }

        this.rating = rating;
    }

    public void setComment(String comment) {

        if (comment == null) {
            this.comment = null;
            return;
        }

        String normalizedComment = comment.trim();

        if (normalizedComment.length() > 1000) {
            throw new IllegalArgumentException(
                    "Review comment cannot exceed 1000 characters");
        }

        this.comment = normalizedComment.isEmpty()
                ? null
                : normalizedComment;
    }

    public void setUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "Review user cannot be null");
        }

        this.user = user;
    }

    public void setProduct(Product product) {

        if (product == null) {
            throw new IllegalArgumentException(
                    "Review product cannot be null");
        }

        this.product = product;
    }
}