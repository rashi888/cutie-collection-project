package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.ProductResponse;
import com.cutie.collection.backend.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService) {

        this.productService = productService;
    }

    /**
     * Returns all active products.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>>
            getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts());
    }

    /**
     * Returns one active product.
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse>
            getProductById(
                    @PathVariable
                    Long productId) {

        return ResponseEntity.ok(
                productService
                        .getProductResponseById(
                                productId));
    }

    /**
     * Returns active products belonging to an active category.
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>>
            getProductsByCategory(
                    @PathVariable
                    Long categoryId) {

        return ResponseEntity.ok(
                productService
                        .getProductsByCategory(
                                categoryId));
    }

    /**
     * Returns paginated and sorted active products.
     */
    @GetMapping("/paged")
    public ResponseEntity<Page<ProductResponse>>
            getProductsPaged(
                    @RequestParam(
                            defaultValue = "0")
                    int page,
                    @RequestParam(
                            defaultValue = "12")
                    int size,
                    @RequestParam(
                            defaultValue = "createdAt")
                    String sortBy,
                    @RequestParam(
                            defaultValue = "desc")
                    String direction) {

        return ResponseEntity.ok(
                productService.getProducts(
                        page,
                        size,
                        sortBy,
                        direction));
    }

    /**
     * Searches active products by name.
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>>
            searchProducts(
                    @RequestParam
                    String keyword) {

        return ResponseEntity.ok(
                productService.searchProducts(
                        keyword));
    }
}