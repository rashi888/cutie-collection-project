package com.cutie.collection.backend.exception;

public class CategoryNotFoundException
        extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public CategoryNotFoundException(Long categoryId) {
        super("Category not found with ID: " + categoryId);
    }

    public CategoryNotFoundException(String message) {
        super(message);
    }
}