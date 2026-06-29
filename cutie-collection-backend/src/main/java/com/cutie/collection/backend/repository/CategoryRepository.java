package com.cutie.collection.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);
}