package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.WishlistItem;

public interface WishlistRepository
        extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findAllByUserIdOrderByCreatedAtDesc(
            Long userId);

    Optional<WishlistItem> findByIdAndUserId(
            Long wishlistItemId,
            Long userId);

    Optional<WishlistItem> findByUserIdAndProductId(
            Long userId,
            Long productId);

    boolean existsByUserIdAndProductId(
            Long userId,
            Long productId);

    long countByUserId(
            Long userId);

    long deleteByUserIdAndProductId(
            Long userId,
            Long productId);

    long deleteAllByUserId(
            Long userId);
}