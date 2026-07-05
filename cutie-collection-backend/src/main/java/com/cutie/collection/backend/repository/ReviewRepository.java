package com.cutie.collection.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Review;

public interface ReviewRepository
        extends JpaRepository<Review, Long> {

	List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
}
