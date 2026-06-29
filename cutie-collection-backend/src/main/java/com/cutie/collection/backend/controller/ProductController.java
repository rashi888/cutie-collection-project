package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cutie.collection.backend.dto.ProductRequest;
import com.cutie.collection.backend.dto.ProductResponse;
import com.cutie.collection.backend.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService) {
        this.productService = productService;
    }

    // CREATE PRODUCT
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ALL PRODUCTS
    @GetMapping
    public ResponseEntity<List<ProductResponse>>
            getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts());
    }

    // GET PRODUCT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse>
            getProductById(@PathVariable Long id) {

        return ResponseEntity.ok(
                productService.getProductById(id));
    }

    // UPDATE PRODUCT
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse>
            updateProduct(
                    @PathVariable Long id,
                    @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.ok(
                productService.updateProduct(id, request));
    }

    // DELETE PRODUCT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
            deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }

    // GET PRODUCTS BY CATEGORY
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>>
            getProductsByCategory(
                    @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(
                        categoryId));
    }
}