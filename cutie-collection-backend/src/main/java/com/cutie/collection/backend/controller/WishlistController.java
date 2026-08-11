package com.cutie.collection.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.WishlistResponse;
import com.cutie.collection.backend.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(
            WishlistService wishlistService) {

        this.wishlistService = wishlistService;
    }

    /**
     * Returns the authenticated customer's wishlist.
     */
    @GetMapping
    public ResponseEntity<List<WishlistResponse>>
            getWishlist() {

        return ResponseEntity.ok(
                wishlistService.getWishlist());
    }

    /**
     * Returns the number of wishlist items.
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>>
            countWishlistItems() {

        long count =
                wishlistService
                        .countWishlistItems();

        return ResponseEntity.ok(
                Map.of("count", count));
    }

    /**
     * Adds a product to the authenticated customer's wishlist.
     */
    @PostMapping("/{productId}")
    public ResponseEntity<WishlistResponse>
            addToWishlist(
                    @PathVariable
                    Long productId) {

        WishlistResponse response =
                wishlistService.addToWishlist(
                        productId);

        return ResponseEntity
                .created(
                        URI.create(
                                "/api/wishlist/"
                                        + productId))
                .body(response);
    }

    /**
     * Removes one product from the authenticated customer's wishlist.
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void>
            removeFromWishlist(
                    @PathVariable
                    Long productId) {

        wishlistService.removeFromWishlist(
                productId);

        return ResponseEntity
                .noContent()
                .build();
    }

    /**
     * Clears the authenticated customer's wishlist.
     */
    @DeleteMapping
    public ResponseEntity<Void> clearWishlist() {

        wishlistService.clearWishlist();

        return ResponseEntity
                .noContent()
                .build();
    }
}