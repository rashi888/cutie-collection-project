package com.cutie.collection.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderRequest {

    @NotBlank(
            message = "Shipping address is required")
    private String shippingAddress;

    public OrderRequest() {
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(
            String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}