package com.cutie.collection.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "order_number",
            nullable = false,
            unique = true,
            length = 50)
    private String orderNumber;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false)
    private User user;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "order_status",
            nullable = false,
            length = 30)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "payment_status",
            nullable = false,
            length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @OneToOne(
            mappedBy = "order",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Payment payment;

    /*
     * Shipping-address snapshot fields.
     *
     * These values remain unchanged even if the customer later edits
     * or deletes the original address.
     */

    @Column(
            name = "shipping_full_name",
            length = 100)
    private String shippingFullName;

    @Column(
            name = "shipping_phone_number",
            length = 20)
    private String shippingPhoneNumber;

    @Column(
            name = "shipping_address_line_1",
            length = 255)
    private String shippingAddressLine1;

    @Column(
            name = "shipping_address_line_2",
            length = 255)
    private String shippingAddressLine2;

    @Column(
            name = "shipping_city",
            length = 100)
    private String shippingCity;

    @Column(
            name = "shipping_state",
            length = 100)
    private String shippingState;

    @Column(
            name = "shipping_postal_code",
            length = 20)
    private String shippingPostalCode;

    @Column(
            name = "shipping_country",
            length = 100)
    private String shippingCountry;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false)
    private LocalDateTime updatedAt;

    public Order() {
    }

    public Order(User user) {
        setUser(user);
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (orderNumber == null || orderNumber.isBlank()) {
            orderNumber = generateOrderNumber();
        }

        if (orderStatus == null) {
            orderStatus = OrderStatus.PENDING;
        }

        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private String generateOrderNumber() {

        return "CC-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    public void addItem(OrderItem orderItem) {

        if (orderItem == null) {
            throw new IllegalArgumentException(
                    "Order item cannot be null");
        }

        items.add(orderItem);
        orderItem.setOrder(this);
    }

    public void removeItem(OrderItem orderItem) {

        if (orderItem == null) {
            return;
        }

        items.remove(orderItem);
        orderItem.setOrder(null);
    }

    public void assignPayment(Payment payment) {

        this.payment = payment;

        if (payment != null && payment.getOrder() != this) {
            payment.setOrder(this);
        }
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public User getUser() {
        return user;
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

    public List<OrderItem> getItems() {
        return items;
    }

    public Payment getPayment() {
        return payment;
    }

    public String getShippingFullName() {
        return shippingFullName;
    }

    public String getShippingPhoneNumber() {
        return shippingPhoneNumber;
    }

    public String getShippingAddressLine1() {
        return shippingAddressLine1;
    }

    public String getShippingAddressLine2() {
        return shippingAddressLine2;
    }

    public String getShippingCity() {
        return shippingCity;
    }

    public String getShippingState() {
        return shippingState;
    }

    public String getShippingPostalCode() {
        return shippingPostalCode;
    }

    public String getShippingCountry() {
        return shippingCountry;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "Order user cannot be null");
        }

        this.user = user;
    }

    public void setTotalAmount(BigDecimal totalAmount) {

        if (totalAmount == null
                || totalAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Order total amount cannot be negative");
        }

        this.totalAmount = totalAmount;
    }

    public void setOrderStatus(OrderStatus orderStatus) {

        if (orderStatus == null) {
            throw new IllegalArgumentException(
                    "Order status cannot be null");
        }

        this.orderStatus = orderStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {

        if (paymentStatus == null) {
            throw new IllegalArgumentException(
                    "Payment status cannot be null");
        }

        this.paymentStatus = paymentStatus;
    }

    public void setItems(List<OrderItem> items) {

        this.items.clear();

        if (items == null) {
            return;
        }

        for (OrderItem item : items) {
            addItem(item);
        }
    }

    public void setShippingFullName(String shippingFullName) {
        this.shippingFullName = normalize(shippingFullName);
    }

    public void setShippingPhoneNumber(String shippingPhoneNumber) {
        this.shippingPhoneNumber = normalize(shippingPhoneNumber);
    }

    public void setShippingAddressLine1(String shippingAddressLine1) {
        this.shippingAddressLine1 = normalize(shippingAddressLine1);
    }

    public void setShippingAddressLine2(String shippingAddressLine2) {
        this.shippingAddressLine2 = normalize(shippingAddressLine2);
    }

    public void setShippingCity(String shippingCity) {
        this.shippingCity = normalize(shippingCity);
    }

    public void setShippingState(String shippingState) {
        this.shippingState = normalize(shippingState);
    }

    public void setShippingPostalCode(String shippingPostalCode) {
        this.shippingPostalCode = normalize(shippingPostalCode);
    }

    public void setShippingCountry(String shippingCountry) {
        this.shippingCountry = normalize(shippingCountry);
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