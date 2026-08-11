package com.cutie.collection.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.CategoryRequest;
import com.cutie.collection.backend.dto.CategoryResponse;
import com.cutie.collection.backend.service.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(
            CategoryService categoryService) {

        this.categoryService = categoryService;
    }

    /**
     * Creates a new category.
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        CategoryResponse response =
                categoryService.createCategory(request);

        URI location = URI.create(
                "/api/admin/categories/"
                        + response.getId());

        return ResponseEntity
                .created(location)
                .body(response);
    }

    /**
     * Returns all categories, including inactive categories.
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {

        return ResponseEntity.ok(
                categoryService.getAllCategoriesForAdmin());
    }

    /**
     * Returns one category, including an inactive category.
     */
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                categoryService.getCategoryByIdForAdmin(
                        categoryId));
    }

    /**
     * Updates an existing category.
     */
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request) {

        return ResponseEntity.ok(
                categoryService.updateCategory(
                        categoryId,
                        request));
    }

    /**
     * Reactivates an inactive category.
     */
    @PatchMapping("/{categoryId}/activate")
    public ResponseEntity<CategoryResponse> activateCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                categoryService.activateCategory(
                        categoryId));
    }

    /**
     * Deactivates an active category.
     */
    @PatchMapping("/{categoryId}/deactivate")
    public ResponseEntity<CategoryResponse> deactivateCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                categoryService.deactivateCategory(
                        categoryId));
    }

    /**
     * Soft-deletes a category.
     *
     * CategoryService currently implements deletion by setting active=false.
     */
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long categoryId) {

        categoryService.deleteCategory(categoryId);

        return ResponseEntity
                .noContent()
                .build();
    }
}