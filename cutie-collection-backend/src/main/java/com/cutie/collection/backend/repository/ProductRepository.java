package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Product;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    boolean existsByNameIgnoreCase(
            String name);

    boolean existsByNameIgnoreCaseAndIdNot(
            String name,
            Long productId);

    Optional<Product> findByIdAndActiveTrue(
            Long productId);

    List<Product> findAllByActiveTrueOrderByCreatedAtDesc();

    Page<Product> findAllByActiveTrue(
            Pageable pageable);

    List<Product> findAllByCategoryIdAndActiveTrueOrderByNameAsc(
            Long categoryId);

    Page<Product> findAllByCategoryIdAndActiveTrue(
            Long categoryId,
            Pageable pageable);

    List<Product> findAllByNameContainingIgnoreCaseAndActiveTrue(
            String keyword);

    Page<Product> findAllByNameContainingIgnoreCaseAndActiveTrue(
            String keyword,
            Pageable pageable);

    Page<Product> findAllByActiveTrueAndStockQuantityGreaterThan(
            Integer minimumStockQuantity,
            Pageable pageable);

    List<Product> findAllByActiveTrueAndStockQuantityLessThanEqualOrderByStockQuantityAsc(
            Integer stockThreshold);
}