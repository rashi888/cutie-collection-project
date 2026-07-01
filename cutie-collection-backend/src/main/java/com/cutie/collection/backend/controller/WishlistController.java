package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
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

    @GetMapping
    public List<WishlistResponse>
            getWishlist(
                    Authentication authentication) {

        return wishlistService
                .getWishlist();
    }

    @PostMapping("/add/{productId}")
    public void addToWishlist(
            @PathVariable Long productId) {

        wishlistService.addToWishlist(
                productId);
    }

    @DeleteMapping("/remove/{productId}")
    public void removeFromWishlist(
            @PathVariable Long productId
            ) {

        wishlistService.removeFromWishlist(
                productId
                );
    }

    @DeleteMapping("/clear")
    public void clearWishlist(
            ) {

        wishlistService.clearWishlist(
                );
    }
}