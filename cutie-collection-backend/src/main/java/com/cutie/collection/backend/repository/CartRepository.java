package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.CartItem;

public interface CartRepository
        extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndProductId(
            Long userId,
            Long productId);
}


