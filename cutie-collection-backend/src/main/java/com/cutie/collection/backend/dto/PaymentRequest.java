package com.cutie.collection.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PaymentRequest {

    @NotNull(message = "Application order ID is required")
    @Positive(message = "Application order ID must be greater than zero")
    private Long orderId;

    public PaymentRequest() {
    }

    public PaymentRequest(Long orderId) {
        this.orderId = orderId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}