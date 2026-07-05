package com.cutie.collection.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cutie.collection.backend.dto.ReviewRequest;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.Review;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.ReviewRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            ProductRepository productRepository) {

        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public Review createReview(
            ReviewRequest request) {

        System.out.println("Product Id = "
                + request.getProductId());

        Product product =
                productRepository.findById(
                        request.getProductId())
                        .orElseThrow();

        System.out.println("Product Found");

        Review review = new Review();

        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUserName(request.getUserName());

        Review saved =
                reviewRepository.save(review);

        System.out.println("Review Saved");

        return saved;
    }

    public List<Review> getReviewsByProduct(
            Long productId) {

        return reviewRepository
                .findByProductIdOrderByCreatedAtDesc(
                        productId);
    }
}