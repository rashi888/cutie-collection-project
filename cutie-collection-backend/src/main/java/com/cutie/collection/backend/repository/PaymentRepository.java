package com.cutie.collection.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cutie.collection.backend.entity.Payment;

@Repository
public interface PaymentRepository
extends JpaRepository<Payment, Long> {
	
}