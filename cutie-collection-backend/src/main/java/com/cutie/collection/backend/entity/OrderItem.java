package com.cutie.collection.backend.entity;

import java.math.BigDecimal;
import java.math.RoundingMode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_items")
public class OrderItem {

    private static final int MONEY_SCALE = 2;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false)
    private Order order;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false)
    private Product product;

    /*
     * Product-name snapshot.
     *
     * If the product name changes later, the order history will still
     * show the name used when the customer placed the order.
     */
    @Column(
            name = "product_name",
            nullable = false,
            length = 255)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    /*
     * Product price at the time the order was placed.
     */
    @Column(
            nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal price;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal subtotal;

    protected OrderItem() {
    }

    public OrderItem(
            Product product,
            Integer quantity,
            BigDecimal price) {

        setProduct(product);
        setQuantity(quantity);
        setPrice(price);
        calculateSubtotal();
    }

    @PrePersist
    protected void onCreate() {

        validateState();
        calculateSubtotal();
    }

    @PreUpdate
    protected void onUpdate() {

        validateState();
        calculateSubtotal();
    }

    private void validateState() {

        if (order == null) {
            throw new IllegalStateException(
                    "Order item must belong to an order");
        }

        if (product == null) {
            throw new IllegalStateException(
                    "Order item product cannot be null");
        }

        if (productName == null || productName.isBlank()) {
            throw new IllegalStateException(
                    "Order item product name cannot be blank");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalStateException(
                    "Order item quantity must be greater than zero");
        }

        if (price == null
                || price.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Order item price must be greater than zero");
        }
    }

    private void calculateSubtotal() {

        if (price == null || quantity == null) {
            return;
        }

        subtotal = price
                .multiply(BigDecimal.valueOf(quantity))
                .setScale(
                        MONEY_SCALE,
                        RoundingMode.HALF_UP);
    }

    public Long getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    public Product getProduct() {
        return product;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public void setProduct(Product product) {

        if (product == null) {
            throw new IllegalArgumentException(
                    "Order item product cannot be null");
        }

        this.product = product;
        this.productName = product.getName();
    }

    public void setQuantity(Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Order item quantity must be greater than zero");
        }

        this.quantity = quantity;
        calculateSubtotal();
    }

    public void setPrice(BigDecimal price) {

        if (price == null
                || price.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Order item price must be greater than zero");
        }

        this.price = price.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP);

        calculateSubtotal();
    }
}