package com.cutie.collection.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false,
            unique = true)
    private Order order;

    @Column(
            name = "razorpay_order_id",
            unique = true,
            length = 100)
    private String razorpayOrderId;

    @Column(
            name = "razorpay_payment_id",
            unique = true,
            length = 100)
    private String razorpayPaymentId;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal amount;

    @Column(
            nullable = false,
            length = 10)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(
            name = "payment_status",
            nullable = false,
            length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(
            name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false)
    private LocalDateTime updatedAt;

    public Payment() {
    }

    public Payment(
            Order order,
            BigDecimal amount) {

        setOrder(order);
        setAmount(amount);
        this.currency = "INR";
        this.paymentStatus = PaymentStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void markCreated(String razorpayOrderId) {

        setRazorpayOrderId(razorpayOrderId);
        this.paymentStatus = PaymentStatus.CREATED;
    }

    public void markPaid(String razorpayPaymentId) {

        setRazorpayPaymentId(razorpayPaymentId);

        this.paymentStatus = PaymentStatus.PAID;
        this.paymentDate = LocalDateTime.now();

        if (order != null) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setOrderStatus(OrderStatus.CONFIRMED);
        }
    }

    public void markFailed() {

        this.paymentStatus = PaymentStatus.FAILED;

        if (order != null) {
            order.setPaymentStatus(PaymentStatus.FAILED);
        }
    }

    public void markRefunded() {

        this.paymentStatus = PaymentStatus.REFUNDED;

        if (order != null) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
    }

    public Long getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setOrder(Order order) {

        if (order == null) {
            throw new IllegalArgumentException(
                    "Payment order cannot be null");
        }

        this.order = order;
    }

    public void setRazorpayPaymentId(
            String razorpayPaymentId) {

        this.razorpayPaymentId =
                normalize(razorpayPaymentId);
    }

    public void setRazorpayOrderId(
            String razorpayOrderId) {

        this.razorpayOrderId =
                normalize(razorpayOrderId);
    }

    public void setAmount(BigDecimal amount) {

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero");
        }

        this.amount = amount;
    }

    public void setCurrency(String currency) {

        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException(
                    "Payment currency cannot be blank");
        }

        this.currency = currency.trim().toUpperCase();
    }

    public void setPaymentStatus(
            PaymentStatus paymentStatus) {

        if (paymentStatus == null) {
            throw new IllegalArgumentException(
                    "Payment status cannot be null");
        }

        this.paymentStatus = paymentStatus;
    }

    private String normalize(String value) {

        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();

        return normalizedValue.isEmpty()
                ? null
                : normalizedValue;
    }
}