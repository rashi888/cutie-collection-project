package com.cutie.collection.backend.exception;

public class OrderNotFoundException
        extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public OrderNotFoundException(Long orderId) {
        super("Order not found with ID: " + orderId);
    }

    public OrderNotFoundException(String message) {
        super(message);
    }
}