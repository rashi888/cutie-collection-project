package com.cutie.collection.backend.dto;

public class PaymentResponse {

    private String orderId;
    private Integer amount;
    private String currency;

    public PaymentResponse() {
    }

    public PaymentResponse(
            String orderId,
            Integer amount,
            String currency) {

        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}