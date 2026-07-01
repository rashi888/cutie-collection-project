package com.cutie.collection.backend.dto;

import java.math.BigDecimal;

public class WishlistResponse {

    private Long productId;

    private String productName;

    private String imageUrl;

    private String categoryName;

    private BigDecimal price;

    private Integer stockQuantity;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(
            String productName) {
        this.productName = productName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(
            String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(
            String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(
            BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(
            Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
}