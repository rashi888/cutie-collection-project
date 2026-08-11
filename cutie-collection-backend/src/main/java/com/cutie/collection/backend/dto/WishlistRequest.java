package com.cutie.collection.backend.dto;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class WishlistRequest {

    @NotNull(message = "Product ID is required")
    @Positive(message = "Product ID must be greater than zero")
    private Long productId;

    public WishlistRequest() {
    }

    public WishlistRequest(Long productId) {
        this.productId = productId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}