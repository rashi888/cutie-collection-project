package com.cutie.collection.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.CategoryRequest;
import com.cutie.collection.backend.dto.CategoryResponse;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.exception.CategoryNotFoundException;
import com.cutie.collection.backend.exception.ConflictException;
import com.cutie.collection.backend.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(
            CategoryRepository categoryRepository) {

        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CategoryResponse createCategory(
            CategoryRequest request) {

        String normalizedName =
                request.getName().trim();

        if (categoryRepository
                .existsByNameIgnoreCase(
                        normalizedName)) {

            throw new ConflictException(
                    "Category already exists with name: "
                            + normalizedName);
        }

        Category category = new Category(
                normalizedName,
                request.getDescription()
        );

        Category savedCategory =
                categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    /**
     * Returns only active categories for customer-facing APIs.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse>
            getAllCategories() {

        return categoryRepository
                .findAllByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Returns all categories, including inactive ones, for administrators.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse>
            getAllCategoriesForAdmin() {

        return categoryRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Customer-facing lookup that returns active categories only.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {

        Category category = categoryRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(id));

        return mapToResponse(category);
    }

    /**
     * Administrator lookup that may return an inactive category.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryByIdForAdmin(
            Long id) {

        return mapToResponse(
                findCategoryForAdmin(id));
    }

    @Transactional
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request) {

        Category category =
                findCategoryForAdmin(id);

        String normalizedName =
                request.getName().trim();

        boolean conflictingName =
                categoryRepository
                        .existsByNameIgnoreCaseAndIdNot(
                                normalizedName,
                                id);

        if (conflictingName) {
            throw new ConflictException(
                    "Category already exists with name: "
                            + normalizedName);
        }

        category.setName(normalizedName);
        category.setDescription(
                request.getDescription());

        Category savedCategory =
                categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    /**
     * Performs a soft deletion instead of permanently deleting the row.
     */
    @Transactional
    public void deleteCategory(Long id) {

        Category category =
                findCategoryForAdmin(id);

        category.deactivate();

        categoryRepository.save(category);
    }

    @Transactional
    public CategoryResponse activateCategory(Long id) {

        Category category =
                findCategoryForAdmin(id);

        category.activate();

        return mapToResponse(
                categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse deactivateCategory(
            Long id) {

        Category category =
                findCategoryForAdmin(id);

        category.deactivate();

        return mapToResponse(
                categoryRepository.save(category));
    }

    private Category findCategoryForAdmin(Long id) {

        return categoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(id));
    }

    private CategoryResponse mapToResponse(
            Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}