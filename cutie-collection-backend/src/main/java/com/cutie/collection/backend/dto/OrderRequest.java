package com.cutie.collection.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OrderRequest {

    @NotNull(message = "Shipping address ID is required")
    @Positive(message = "Shipping address ID must be greater than zero")
    private Long addressId;

    public OrderRequest() {
    }

    public OrderRequest(Long addressId) {
        this.addressId = addressId;
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }
}