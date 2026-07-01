package com.cutie.collection.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cutie.collection.backend.entity.Product;

@Repository
public interface ProductRepository
        extends JpaRepository<Product, Long> {

    boolean existsByName(String name);

    List<Product> findByCategoryId(Long categoryId);

    Page<Product> findAll(Pageable pageable);
    
    List<Product> findByNameContainingIgnoreCase(
            String keyword);
}