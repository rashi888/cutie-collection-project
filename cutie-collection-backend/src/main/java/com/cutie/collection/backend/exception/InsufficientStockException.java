package com.cutie.collection.backend.exception;

public class InsufficientStockException
        extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public InsufficientStockException(
            String productName,
            int requestedQuantity,
            int availableQuantity) {

        super(
                "Insufficient stock for product '"
                        + productName
                        + "'. Requested: "
                        + requestedQuantity
                        + ", available: "
                        + availableQuantity
        );
    }

    public InsufficientStockException(String message) {
        super(message);
    }
}