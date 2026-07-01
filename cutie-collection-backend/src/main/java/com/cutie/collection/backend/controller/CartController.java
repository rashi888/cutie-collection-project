package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.cutie.collection.backend.dto.CartRequest;
import com.cutie.collection.backend.dto.CartResponse;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService,
                          UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    // ✅ Helper: get logged-in user's ID from JWT
    private Long getLoggedInUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // Add item to cart
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartRequest request) {

        Long userId = getLoggedInUserId(userDetails);
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    // Get all cart items
    @GetMapping
    public ResponseEntity<List<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getLoggedInUserId(userDetails);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    // Update quantity
    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long itemId,
            @RequestBody CartRequest request) {

        return ResponseEntity.ok(
                cartService.updateQuantity(itemId, request.getQuantity()));
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
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getLoggedInUserId(userDetails);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}