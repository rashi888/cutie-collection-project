package com.cutie.collection.backend.dto;

import java.math.BigDecimal;

public class PaymentRequest {

    private BigDecimal amount;

    public PaymentRequest() {
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}