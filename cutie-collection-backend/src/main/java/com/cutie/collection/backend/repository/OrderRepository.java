package com.cutie.collection.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Order;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);
}