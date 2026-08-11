package com.cutie.collection.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WishlistResponse {

    private Long id;

    private Long productId;
    private String productName;
    private String imageUrl;

    private Long categoryId;
    private String categoryName;

    private BigDecimal price;
    private Integer stockQuantity;

    private boolean productActive;
    private boolean inStock;

    private LocalDateTime addedAt;

    public WishlistResponse() {
    }

    public WishlistResponse(
            Long id,
            Long productId,
            String productName,
            String imageUrl,
            Long categoryId,
            String categoryName,
            BigDecimal price,
            Integer stockQuantity,
            boolean productActive,
            LocalDateTime addedAt) {

        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.productActive = productActive;
        this.inStock = stockQuantity != null && stockQuantity > 0;
        this.addedAt = addedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public boolean isProductActive() {
        return productActive;
    }

    public boolean isInStock() {
        return inStock;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setStockQuantity(Integer stockQuantity) {

        this.stockQuantity = stockQuantity;
        this.inStock = stockQuantity != null && stockQuantity > 0;
    }

    public void setProductActive(boolean productActive) {
        this.productActive = productActive;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}