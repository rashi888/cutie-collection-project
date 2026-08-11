package com.cutie.collection.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Payment;
import com.cutie.collection.backend.entity.PaymentStatus;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(
            Long orderId);

    Optional<Payment> findByOrderIdAndOrderUserId(
            Long orderId,
            Long userId);

    Optional<Payment> findByRazorpayOrderId(
            String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(
            String razorpayPaymentId);

    boolean existsByOrderId(
            Long orderId);

    boolean existsByRazorpayOrderId(
            String razorpayOrderId);

    boolean existsByRazorpayPaymentId(
            String razorpayPaymentId);

    long countByPaymentStatus(
            PaymentStatus paymentStatus);
}