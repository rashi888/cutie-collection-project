package com.cutie.collection.backend.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.WishlistResponse;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.entity.WishlistItem;
import com.cutie.collection.backend.exception.ConflictException;
import com.cutie.collection.backend.exception.ProductNotFoundException;
import com.cutie.collection.backend.exception.ResourceNotFoundException;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.repository.WishlistRepository;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WishlistResponse addToWishlist(
            Long productId) {

        User user = getCurrentUser();

        if (wishlistRepository
                .existsByUserIdAndProductId(
                        user.getId(),
                        productId)) {

            throw new ConflictException(
                    "Product is already present in the wishlist");
        }

        Product product = productRepository
                .findByIdAndActiveTrue(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                productId));

        WishlistItem item =
                new WishlistItem(
                        user,
                        product);

        return mapToResponse(
                wishlistRepository.save(item));
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist() {

        User user = getCurrentUser();

        return wishlistRepository
                .findAllByUserIdOrderByCreatedAtDesc(
                        user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void removeFromWishlist(
            Long productId) {

        User user = getCurrentUser();

        long deletedRows =
                wishlistRepository
                        .deleteByUserIdAndProductId(
                                user.getId(),
                                productId);

        if (deletedRows == 0) {
            throw new ResourceNotFoundException(
                    "Product was not found in the wishlist");
        }
    }

    @Transactional
    public void clearWishlist() {

        User user = getCurrentUser();

        wishlistRepository
                .deleteAllByUserId(
                        user.getId());
    }

    @Transactional(readOnly = true)
    public long countWishlistItems() {

        User user = getCurrentUser();

        return wishlistRepository
                .countByUserId(
                        user.getId());
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                        authentication.getPrincipal())) {

            throw new AuthenticationCredentialsNotFoundException(
                    "Authentication is required");
        }

        return userRepository
                .findByEmailIgnoreCaseAndActiveTrue(
                        authentication.getName())
                .orElseThrow(() ->
                        new AuthenticationCredentialsNotFoundException(
                                "Authenticated user was not found"));
    }

    private WishlistResponse mapToResponse(
            WishlistItem item) {

        Product product =
                item.getProduct();

        Category category =
                product.getCategory();

        return new WishlistResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                category.getId(),
                category.getName(),
                product.getPrice(),
                product.getStockQuantity(),
                product.isActive(),
                item.getCreatedAt()
        );
    }
}