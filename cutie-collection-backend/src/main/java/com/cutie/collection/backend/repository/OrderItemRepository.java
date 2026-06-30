package com.cutie.collection.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.OrderItem;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

}