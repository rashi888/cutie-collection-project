package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cutie.collection.backend.dto.ReviewRequest;
import com.cutie.collection.backend.entity.Review;
import com.cutie.collection.backend.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(
            ReviewService reviewService) {

        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @RequestBody ReviewRequest request) {

        System.out.println("ProductId = " + request.getProductId());
        System.out.println("UserName = " + request.getUserName());
        System.out.println("Rating = " + request.getRating());
        System.out.println("Comment = " + request.getComment());

        return ResponseEntity.ok(
                reviewService.createReview(request));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>>
            getReviews(
                    @PathVariable Long productId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByProduct(
                        productId));
    }
}