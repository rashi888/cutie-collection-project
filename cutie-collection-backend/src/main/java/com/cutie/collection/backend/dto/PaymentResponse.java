package com.cutie.collection.backend.dto;

import java.math.BigDecimal;

import com.cutie.collection.backend.entity.PaymentStatus;

public class PaymentResponse {

    private Long applicationOrderId;
    private String applicationOrderNumber;

    private String razorpayOrderId;

    /*
     * Razorpay amount expressed in the smallest currency unit.
     * For INR, this value is in paise.
     */
    private Long amount;

    private BigDecimal displayAmount;
    private String currency;

    /*
     * Razorpay public key ID.
     * This is safe for the frontend.
     * Never return the Razorpay secret key.
     */
    private String keyId;

    private PaymentStatus paymentStatus;

    public PaymentResponse() {
    }

    public PaymentResponse(
            Long applicationOrderId,
            String applicationOrderNumber,
            String razorpayOrderId,
            Long amount,
            BigDecimal displayAmount,
            String currency,
            String keyId,
            PaymentStatus paymentStatus) {

        this.applicationOrderId = applicationOrderId;
        this.applicationOrderNumber =
                applicationOrderNumber;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.displayAmount = displayAmount;
        this.currency = currency;
        this.keyId = keyId;
        this.paymentStatus = paymentStatus;
    }

    public Long getApplicationOrderId() {
        return applicationOrderId;
    }

    public String getApplicationOrderNumber() {
        return applicationOrderNumber;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public Long getAmount() {
        return amount;
    }

    public BigDecimal getDisplayAmount() {
        return displayAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getKeyId() {
        return keyId;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setApplicationOrderId(
            Long applicationOrderId) {

        this.applicationOrderId =
                applicationOrderId;
    }

    public void setApplicationOrderNumber(
            String applicationOrderNumber) {

        this.applicationOrderNumber =
                applicationOrderNumber;
    }

    public void setRazorpayOrderId(
            String razorpayOrderId) {

        this.razorpayOrderId = razorpayOrderId;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public void setDisplayAmount(
            BigDecimal displayAmount) {

        this.displayAmount = displayAmount;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public void setPaymentStatus(
            PaymentStatus paymentStatus) {

        this.paymentStatus = paymentStatus;
    }
}