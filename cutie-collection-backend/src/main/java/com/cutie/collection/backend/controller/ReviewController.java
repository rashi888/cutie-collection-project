package com.cutie.collection.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.ReviewRequest;
import com.cutie.collection.backend.dto.ReviewResponse;
import com.cutie.collection.backend.service.CurrentUserService;
import com.cutie.collection.backend.service.ReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;

    public ReviewController(
            ReviewService reviewService,
            CurrentUserService currentUserService) {

        this.reviewService = reviewService;
        this.currentUserService = currentUserService;
    }

    /**
     * Returns reviews for a product.
     *
     * This endpoint is public.
     */
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<ReviewResponse>>
            getReviewsByProduct(
                    @PathVariable
                    Long productId) {

        return ResponseEntity.ok(
                reviewService
                        .getReviewsByProduct(
                                productId));
    }

    /**
     * Returns the average rating for a product.
     *
     * This endpoint is public.
     */
    @GetMapping("/products/{productId}/reviews/average")
    public ResponseEntity<Map<String, Double>>
            getAverageRating(
                    @PathVariable
                    Long productId) {

        Double averageRating =
                reviewService.getAverageRating(
                        productId);

        return ResponseEntity.ok(
                Map.of(
                        "averageRating",
                        averageRating));
    }

    /**
     * Creates one review for the authenticated customer.
     */
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ReviewResponse>
            createReview(
                    Authentication authentication,
                    @PathVariable
                    Long productId,
                    @Valid
                    @RequestBody
                    ReviewRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        ReviewResponse response =
                reviewService.createReview(
                        userId,
                        productId,
                        request);

        return ResponseEntity
                .created(
                        URI.create(
                                "/api/reviews/"
                                        + response.getId()))
                .body(response);
    }

    /**
     * Updates a review owned by the authenticated customer.
     */
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewResponse>
            updateReview(
                    Authentication authentication,
                    @PathVariable
                    Long reviewId,
                    @Valid
                    @RequestBody
                    ReviewRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                reviewService.updateReview(
                        userId,
                        reviewId,
                        request));
    }

    /**
     * Deletes a review owned by the authenticated customer.
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            Authentication authentication,
            @PathVariable
            Long reviewId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        reviewService.deleteReview(
                userId,
                reviewId);

        return ResponseEntity
                .noContent()
                .build();
    }
}