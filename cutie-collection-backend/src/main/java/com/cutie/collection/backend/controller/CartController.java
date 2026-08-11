package com.cutie.collection.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.CartRequest;
import com.cutie.collection.backend.dto.CartResponse;
import com.cutie.collection.backend.service.CartService;
import com.cutie.collection.backend.service.CurrentUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final CurrentUserService currentUserService;

    public CartController(
            CartService cartService,
            CurrentUserService currentUserService) {

        this.cartService = cartService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            Authentication authentication,
            @Valid
            @RequestBody
            CartRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        CartResponse response =
                cartService.addToCart(
                        userId,
                        request);

        return ResponseEntity
                .created(
                        URI.create(
                                "/api/cart/items/"
                                        + response.getId()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<CartResponse>> getCart(
            Authentication authentication) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                cartService.getCart(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>>
            countCartItems(
                    Authentication authentication) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        long count =
                cartService.countCartItems(userId);

        return ResponseEntity.ok(
                Map.of("count", count));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            Authentication authentication,
            @PathVariable
            Long cartItemId,
            @Valid
            @RequestBody
            CartRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                cartService.updateQuantity(
                        userId,
                        cartItemId,
                        request.getQuantity()));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeItem(
            Authentication authentication,
            @PathVariable
            Long cartItemId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        cartService.removeFromCart(
                userId,
                cartItemId);

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> removeProduct(
            Authentication authentication,
            @PathVariable
            Long productId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        cartService.removeProductFromCart(
                userId,
                productId);

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            Authentication authentication) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        cartService.clearCart(userId);

        return ResponseEntity
                .noContent()
                .build();
    }
}