package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

import com.cutie.collection.backend.entity.WishlistItem;

public interface WishlistRepository
        extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserId(
            Long userId);

    Optional<WishlistItem>
    findByUserIdAndProductId(
            Long userId,
            Long productId);

    boolean existsByUserIdAndProductId(
            Long userId,
            Long productId);


@Modifying
@Transactional
    void deleteByUserIdAndProductId(
            Long userId,
            Long productId);


@Modifying
@Transactional
    void deleteByUserId(
            Long userId);
}