package com.cutie.collection.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CartResponse {

    private Long id;

    private Long productId;
    private String productName;
    private String imageUrl;

    private Long categoryId;
    private String categoryName;

    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;

    private Integer availableStock;
    private boolean productActive;

    private LocalDateTime addedAt;
    private LocalDateTime updatedAt;

    public CartResponse() {
    }

    public CartResponse(
            Long id,
            Long productId,
            String productName,
            String imageUrl,
            Long categoryId,
            String categoryName,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal subtotal,
            Integer availableStock,
            boolean productActive,
            LocalDateTime addedAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.availableStock = availableStock;
        this.productActive = productActive;
        this.addedAt = addedAt;
        this.updatedAt = updatedAt;
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

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public Integer getAvailableStock() {
        return availableStock;
    }

    public boolean isProductActive() {
        return productActive;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
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

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public void setAvailableStock(Integer availableStock) {
        this.availableStock = availableStock;
    }

    public void setProductActive(boolean productActive) {
        this.productActive = productActive;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}