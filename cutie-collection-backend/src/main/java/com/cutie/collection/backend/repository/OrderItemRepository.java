package com.cutie.collection.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.OrderItem;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findAllByOrderId(
            Long orderId);

    List<OrderItem> findAllByOrderIdAndOrderUserId(
            Long orderId,
            Long userId);

    long countByProductId(
            Long productId);
}