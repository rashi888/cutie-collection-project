package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Category;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findAllByActiveTrueOrderByNameAsc();

    Optional<Category> findByIdAndActiveTrue(
            Long categoryId);

    Optional<Category> findByNameIgnoreCase(
            String name);

    boolean existsByNameIgnoreCase(
            String name);

    boolean existsByNameIgnoreCaseAndIdNot(
            String name,
            Long categoryId);
}