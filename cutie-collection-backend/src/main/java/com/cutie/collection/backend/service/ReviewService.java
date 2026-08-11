package com.cutie.collection.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.ReviewRequest;
import com.cutie.collection.backend.dto.ReviewResponse;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.Review;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.exception.ConflictException;
import com.cutie.collection.backend.exception.ProductNotFoundException;
import com.cutie.collection.backend.exception.ResourceNotFoundException;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.ReviewRepository;
import com.cutie.collection.backend.repository.UserRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse createReview(
            Long userId,
            Long productId,
            ReviewRequest request) {

        User user = findActiveUser(userId);

        Product product = productRepository
                .findByIdAndActiveTrue(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                productId));

        if (reviewRepository
                .existsByUserIdAndProductId(
                        userId,
                        productId)) {

            throw new ConflictException(
                    "You have already reviewed this product");
        }

        Review review = new Review(
                request.getRating(),
                request.getComment(),
                user,
                product
        );

        return mapToResponse(
                reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse>
            getReviewsByProduct(
                    Long productId) {

        if (!productRepository.existsById(
                productId)) {

            throw new ProductNotFoundException(
                    productId);
        }

        return reviewRepository
                .findAllByProductIdOrderByCreatedAtDesc(
                        productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse updateReview(
            Long userId,
            Long reviewId,
            ReviewRequest request) {

        Review review = reviewRepository
                .findByIdAndUserId(
                        reviewId,
                        userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found"));

        review.setRating(
                request.getRating());

        review.setComment(
                request.getComment());

        return mapToResponse(
                reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(
            Long userId,
            Long reviewId) {

        Review review = reviewRepository
                .findByIdAndUserId(
                        reviewId,
                        userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found"));

        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(
            Long productId) {

        if (!productRepository.existsById(
                productId)) {

            throw new ProductNotFoundException(
                    productId);
        }

        return reviewRepository
                .calculateAverageRatingByProductId(
                        productId);
    }

    private User findActiveUser(Long userId) {

        return userRepository
                .findById(userId)
                .filter(User::isActive)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                userId));
    }

    private ReviewResponse mapToResponse(
            Review review) {

        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getId(),
                review.getUser().getName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}