package com.cutie.collection.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.ProductRequest;
import com.cutie.collection.backend.dto.ProductResponse;
import com.cutie.collection.backend.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(
            ProductService productService) {

        this.productService = productService;
    }

    /**
     * Creates a product.
     */
    @PostMapping
    public ResponseEntity<ProductResponse>
            createProduct(
                    @Valid
                    @RequestBody
                    ProductRequest request) {

        ProductResponse response =
                productService.createProduct(
                        request);

        return ResponseEntity
                .created(
                        URI.create(
                                "/api/admin/products/"
                                        + response.getId()))
                .body(response);
    }

    /**
     * Returns active and inactive products for administrators.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>>
            getAllProducts() {

        return ResponseEntity.ok(
                productService
                        .getAllProductsForAdmin());
    }

    /**
     * Returns one product for administrators, including inactive products.
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse>
            getProductById(
                    @PathVariable
                    Long productId) {

        return ResponseEntity.ok(
                productService
                        .getProductByIdForAdmin(
                                productId));
    }

    /**
     * Updates a product.
     */
    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse>
            updateProduct(
                    @PathVariable
                    Long productId,
                    @Valid
                    @RequestBody
                    ProductRequest request) {

        return ResponseEntity.ok(
                productService.updateProduct(
                        productId,
                        request));
    }

    /**
     * Reactivates a deactivated product.
     */
    @PatchMapping("/{productId}/activate")
    public ResponseEntity<ProductResponse>
            activateProduct(
                    @PathVariable
                    Long productId) {

        return ResponseEntity.ok(
                productService.activateProduct(
                        productId));
    }

    /**
     * Soft-deletes a product by marking it inactive.
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable
            Long productId) {

        productService.deleteProduct(
                productId);

        return ResponseEntity
                .noContent()
                .build();
    }
}