package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Order;
import com.cutie.collection.backend.entity.OrderStatus;
import com.cutie.collection.backend.entity.PaymentStatus;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findAllByUserIdOrderByCreatedAtDesc(
            Long userId);

    Page<Order> findAllByUserId(
            Long userId,
            Pageable pageable);

    Optional<Order> findByIdAndUserId(
            Long orderId,
            Long userId);

    Optional<Order> findByOrderNumber(
            String orderNumber);

    Optional<Order> findByOrderNumberAndUserId(
            String orderNumber,
            Long userId);

    boolean existsByIdAndUserId(
            Long orderId,
            Long userId);

    Page<Order> findAllByOrderStatus(
            OrderStatus orderStatus,
            Pageable pageable);

    Page<Order> findAllByPaymentStatus(
            PaymentStatus paymentStatus,
            Pageable pageable);

    Page<Order> findAllByOrderStatusAndPaymentStatus(
            OrderStatus orderStatus,
            PaymentStatus paymentStatus,
            Pageable pageable);

    List<Order> findTop10ByOrderByCreatedAtDesc();

    long countByOrderStatus(
            OrderStatus orderStatus);

    long countByPaymentStatus(
            PaymentStatus paymentStatus);
}