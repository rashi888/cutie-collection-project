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
        name = "cart_items",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_cart_item_user_product",
                        columnNames = {
                                "user_id",
                                "product_id"
                        }
                )
        }
)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @Column(nullable = false)
    private Integer quantity;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false)
    private LocalDateTime updatedAt;

    protected CartItem() {
    }

    public CartItem(
            User user,
            Product product,
            Integer quantity) {

        setUser(user);
        setProduct(product);
        setQuantity(quantity);
    }

    @PrePersist
    protected void onCreate() {

        validateState();

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        validateState();

        updatedAt = LocalDateTime.now();
    }

    private void validateState() {

        if (user == null) {
            throw new IllegalStateException(
                    "Cart item user cannot be null");
        }

        if (product == null) {
            throw new IllegalStateException(
                    "Cart item product cannot be null");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalStateException(
                    "Cart item quantity must be greater than zero");
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Product getProduct() {
        return product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "Cart item user cannot be null");
        }

        this.user = user;
    }

    public void setProduct(Product product) {

        if (product == null) {
            throw new IllegalArgumentException(
                    "Cart item product cannot be null");
        }

        this.product = product;
    }

    public void setQuantity(Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Cart item quantity must be greater than zero");
        }

        this.quantity = quantity;
    }

    public void increaseQuantity(Integer amount) {

        validateQuantityChange(amount);

        this.quantity = this.quantity + amount;
    }

    public void decreaseQuantity(Integer amount) {

        validateQuantityChange(amount);

        int updatedQuantity = this.quantity - amount;

        if (updatedQuantity <= 0) {
            throw new IllegalArgumentException(
                    "Cart item quantity must remain greater than zero");
        }

        this.quantity = updatedQuantity;
    }

    private void validateQuantityChange(Integer amount) {

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException(
                    "Quantity change must be greater than zero");
        }

        if (quantity == null) {
            throw new IllegalStateException(
                    "Current cart quantity is not initialized");
        }
    }
}