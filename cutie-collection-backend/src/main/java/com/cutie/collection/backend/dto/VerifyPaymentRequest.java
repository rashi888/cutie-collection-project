package com.cutie.collection.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class VerifyPaymentRequest {

    @NotNull(message = "Application order ID is required")
    @Positive(message = "Application order ID must be greater than zero")
    private Long applicationOrderId;

    @NotBlank(message = "Razorpay order ID is required")
    @Size(
            max = 100,
            message = "Razorpay order ID cannot exceed 100 characters")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment ID is required")
    @Size(
            max = 100,
            message = "Razorpay payment ID cannot exceed 100 characters")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay signature is required")
    @Size(
            max = 255,
            message = "Razorpay signature cannot exceed 255 characters")
    private String razorpaySignature;

    public VerifyPaymentRequest() {
    }

    public Long getApplicationOrderId() {
        return applicationOrderId;
    }

    public void setApplicationOrderId(
            Long applicationOrderId) {

        this.applicationOrderId =
                applicationOrderId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(
            String razorpayOrderId) {

        this.razorpayOrderId =
                normalize(razorpayOrderId);
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(
            String razorpayPaymentId) {

        this.razorpayPaymentId =
                normalize(razorpayPaymentId);
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(
            String razorpaySignature) {

        this.razorpaySignature =
                normalize(razorpaySignature);
    }

    private String normalize(String value) {

        return value == null
                ? null
                : value.trim();
    }
}