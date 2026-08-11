package com.cutie.collection.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.cutie.collection.backend.entity.OrderStatus;
import com.cutie.collection.backend.entity.PaymentStatus;

public class OrderResponse {

    private Long id;
    private String orderNumber;

    private BigDecimal totalAmount;

    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;

    private ShippingAddressResponse shippingAddress;

    private List<OrderItemResponse> items =
            new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderResponse() {
    }

    public OrderResponse(
            Long id,
            String orderNumber,
            BigDecimal totalAmount,
            OrderStatus orderStatus,
            PaymentStatus paymentStatus,
            ShippingAddressResponse shippingAddress,
            List<OrderItemResponse> items,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.orderNumber = orderNumber;
        this.totalAmount = totalAmount;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
        this.shippingAddress = shippingAddress;
        this.items = items == null
                ? new ArrayList<>()
                : new ArrayList<>(items);
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public OrderStatus getOrderStatus() {
        return orderStatus;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public ShippingAddressResponse getShippingAddress() {
        return shippingAddress;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setOrderStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
    }

    public void setPaymentStatus(
            PaymentStatus paymentStatus) {

        this.paymentStatus = paymentStatus;
    }

    public void setShippingAddress(
            ShippingAddressResponse shippingAddress) {

        this.shippingAddress = shippingAddress;
    }

    public void setItems(
            List<OrderItemResponse> items) {

        this.items = items == null
                ? new ArrayList<>()
                : new ArrayList<>(items);
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}