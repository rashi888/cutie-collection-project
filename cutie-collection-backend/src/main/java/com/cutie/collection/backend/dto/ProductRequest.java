package com.cutie.collection.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(
            min = 2,
            max = 255,
            message = "Product name must be between 2 and 255 characters")
    private String name;

    @Size(
            max = 5000,
            message = "Product description cannot exceed 5000 characters")
    private String description;

    @NotNull(message = "Product price is required")
    @DecimalMin(
            value = "0.01",
            message = "Product price must be greater than zero")
    @DecimalMax(
            value = "9999999999.99",
            message = "Product price is too large")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Product price can contain at most 10 integer digits and 2 decimal places")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @PositiveOrZero(
            message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @Size(
            max = 1000,
            message = "Image URL cannot exceed 1000 characters")
    private String imageUrl;

    @NotNull(message = "Category ID is required")
    @Positive(message = "Category ID must be greater than zero")
    private Long categoryId;

    public ProductRequest() {
    }

    public ProductRequest(
            String name,
            String description,
            BigDecimal price,
            Integer stockQuantity,
            String imageUrl,
            Long categoryId) {

        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = normalize(name);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = normalizeOptional(description);
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = normalizeOptional(imageUrl);
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    private String normalize(String value) {
        return value == null
                ? null
                : value.trim();
    }

    private String normalizeOptional(String value) {

        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();

        return normalizedValue.isEmpty()
                ? null
                : normalizedValue;
    }
}