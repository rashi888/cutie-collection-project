package com.cutie.collection.backend.entity;

import java.math.BigDecimal;
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

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            length = 255)
    private String name;

    @Column(
            columnDefinition = "TEXT")
    private String description;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal price;

    @Column(
            name = "stock_quantity",
            nullable = false)
    private Integer stockQuantity;

    @Column(
            name = "image_url",
            length = 1000)
    private String imageUrl;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "category_id",
            nullable = false)
    private Category category;

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

    public Product() {
    }

    public Product(
            String name,
            String description,
            BigDecimal price,
            Integer stockQuantity,
            String imageUrl,
            Category category) {

        setName(name);
        setDescription(description);
        setPrice(price);
        setStockQuantity(stockQuantity);
        setImageUrl(imageUrl);
        setCategory(category);

        this.active = true;
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void reduceStock(Integer quantity) {

        validateQuantity(quantity);

        if (stockQuantity < quantity) {
            throw new IllegalStateException(
                    "Insufficient stock for product: " + name);
        }

        stockQuantity = stockQuantity - quantity;
    }

    public void increaseStock(Integer quantity) {

        validateQuantity(quantity);

        stockQuantity = stockQuantity + quantity;
    }

    private void validateQuantity(Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
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

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Category getCategory() {
        return category;
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
                    "Product name cannot be blank");
        }

        String normalizedName = name.trim();

        if (normalizedName.length() > 255) {
            throw new IllegalArgumentException(
                    "Product name cannot exceed 255 characters");
        }

        this.name = normalizedName;
    }

    public void setDescription(String description) {

        if (description == null) {
            this.description = null;
            return;
        }

        String normalizedDescription = description.trim();

        this.description = normalizedDescription.isEmpty()
                ? null
                : normalizedDescription;
    }

    public void setPrice(BigDecimal price) {

        if (price == null
                || price.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Product price must be greater than zero");
        }

        this.price = price;
    }

    public void setStockQuantity(Integer stockQuantity) {

        if (stockQuantity == null || stockQuantity < 0) {
            throw new IllegalArgumentException(
                    "Product stock quantity cannot be negative");
        }

        this.stockQuantity = stockQuantity;
    }

    public void setImageUrl(String imageUrl) {

        if (imageUrl == null) {
            this.imageUrl = null;
            return;
        }

        String normalizedImageUrl = imageUrl.trim();

        if (normalizedImageUrl.length() > 1000) {
            throw new IllegalArgumentException(
                    "Product image URL cannot exceed 1000 characters");
        }

        this.imageUrl = normalizedImageUrl.isEmpty()
                ? null
                : normalizedImageUrl;
    }

    public void setCategory(Category category) {

        if (category == null) {
            throw new IllegalArgumentException(
                    "Product category cannot be null");
        }

        this.category = category;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}