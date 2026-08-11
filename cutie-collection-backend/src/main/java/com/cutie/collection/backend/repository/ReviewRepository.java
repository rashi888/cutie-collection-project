package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cutie.collection.backend.entity.Review;

public interface ReviewRepository
        extends JpaRepository<Review, Long> {

    List<Review> findAllByProductIdOrderByCreatedAtDesc(
            Long productId);

    Optional<Review> findByIdAndUserId(
            Long reviewId,
            Long userId);

    Optional<Review> findByUserIdAndProductId(
            Long userId,
            Long productId);

    boolean existsByUserIdAndProductId(
            Long userId,
            Long productId);

    long countByProductId(
            Long productId);

    long deleteByIdAndUserId(
            Long reviewId,
            Long userId);

    @Query("""
            select coalesce(avg(r.rating), 0.0)
            from Review r
            where r.product.id = :productId
            """)
    Double calculateAverageRatingByProductId(
            @Param("productId") Long productId);
}