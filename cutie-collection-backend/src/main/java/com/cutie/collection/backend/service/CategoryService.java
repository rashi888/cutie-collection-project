package com.cutie.collection.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cutie.collection.backend.dto.CategoryRequest;
import com.cutie.collection.backend.dto.CategoryResponse;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.exception.CategoryNotFoundException;
import com.cutie.collection.backend.repository.CategoryRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryResponse createCategory(CategoryRequest request) {

        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException(
                    "Category already exists with name: "
                            + request.getName());
        }

//        Category category = Category.builder()
//                .name(request.getName())
//                .description(request.getDescription())
//                .build();
        
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return mapToResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {

        return mapToResponse(findCategoryById(id));
    }

    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request) {

        Category category = findCategoryById(id);

        if (!category.getName().equals(request.getName())
                && categoryRepository.existsByName(request.getName())) {

            throw new RuntimeException(
                    "Category already exists with name: "
                            + request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return mapToResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {

        Category category = findCategoryById(id);
        categoryRepository.delete(category);
    }

    private Category findCategoryById(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + id));
    }
    private CategoryResponse mapToResponse(Category category) {

        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());

        return response;
    }
    
//    private CategoryResponse mapToResponse(Category category) {
//
//        return CategoryResponse.builder()
//                .id(category.getId())
//                .name(category.getName())
//                .description(category.getDescription())
//                .createdAt(category.getCreatedAt())
//                .updatedAt(category.getUpdatedAt())
//                .build();
//    }
}