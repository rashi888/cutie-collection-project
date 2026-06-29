package com.cutie.collection.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cutie.collection.backend.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Check if product already exists
    boolean existsByName(String name);

    // Get all products of a category
    List<Product> findByCategoryId(Long categoryId);
}