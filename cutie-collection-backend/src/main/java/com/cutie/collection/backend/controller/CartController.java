package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cutie.collection.backend.dto.CartRequest;
import com.cutie.collection.backend.dto.CartResponse;
import com.cutie.collection.backend.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Temporary user id (replace with JWT user later)
    private static final Long USER_ID = 1L;

    // Add item to cart
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody CartRequest request) {

        return ResponseEntity.ok(
                cartService.addToCart(
                        USER_ID,
                        request));
    }

    // Get all cart items
    @GetMapping
    public ResponseEntity<List<CartResponse>> getCart() {

        return ResponseEntity.ok(
                cartService.getCart(USER_ID));
    }

    // Update quantity
    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long itemId,
            @RequestBody CartRequest request) {

        return ResponseEntity.ok(
                cartService.updateQuantity(
                        itemId,
                        request.getQuantity()));
    }

    // Remove item from cart
    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long itemId) {

        cartService.removeFromCart(itemId);

        return ResponseEntity.noContent().build();
    }

    // Clear entire cart
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {

        cartService.clearCart(USER_ID);

        return ResponseEntity.noContent().build();
    }
}