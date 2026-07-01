package com.cutie.collection.backend.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.cutie.collection.backend.dto.WishlistResponse;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.entity.WishlistItem;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.repository.WishlistRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
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

//    private User getCurrentUser(
//            Authentication authentication) {
//
//        String email =
//                authentication.getName();
//
//        return userRepository
//                .findByEmail(email)
//                .orElseThrow();
//    }
    
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            throw new RuntimeException(
                    "User not authenticated");
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));
    }

    public void addToWishlist(
            Long productId) {

        User user =
                getCurrentUser();

        if (wishlistRepository
                .existsByUserIdAndProductId(
                        user.getId(),
                        productId)) {
            return;
        }

        Product product =
                productRepository
                        .findById(productId)
                        .orElseThrow();

        WishlistItem item =
                new WishlistItem();

        item.setUser(user);
        item.setProduct(product);

        wishlistRepository.save(item);
    }

    public List<WishlistResponse>
            getWishlist(
                    ) {

        User user =
                getCurrentUser();

        return wishlistRepository
                .findByUserId(user.getId())
                .stream()
                .map(item -> {

                    WishlistResponse dto =
                            new WishlistResponse();

                    dto.setProductId(
                            item.getProduct().getId());

                    dto.setProductName(
                            item.getProduct().getName());

                    dto.setImageUrl(
                            item.getProduct().getImageUrl());

                    dto.setPrice(
                            item.getProduct().getPrice());

                    dto.setStockQuantity(
                            item.getProduct()
                                    .getStockQuantity());

                    dto.setCategoryName(
                            item.getProduct()
                                    .getCategory()
                                    .getName());

                    return dto;
                })
                .toList();
    }
 @Transactional
    public void removeFromWishlist(
            Long productId) {

        User user =
                getCurrentUser();

        wishlistRepository
                .deleteByUserIdAndProductId(
                        user.getId(),
                        productId);
    }

 @Transactional
    public void clearWishlist() {

        User user =
                getCurrentUser();

        wishlistRepository
                .deleteByUserId(
                        user.getId());
    }
}