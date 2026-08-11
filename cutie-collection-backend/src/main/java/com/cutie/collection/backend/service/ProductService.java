package com.cutie.collection.backend.service;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.ProductRequest;
import com.cutie.collection.backend.dto.ProductResponse;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.exception.BadRequestException;
import com.cutie.collection.backend.exception.CategoryNotFoundException;
import com.cutie.collection.backend.exception.ConflictException;
import com.cutie.collection.backend.exception.ProductNotFoundException;
import com.cutie.collection.backend.repository.CategoryRepository;
import com.cutie.collection.backend.repository.ProductRepository;

@Service
public class ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "name",
                    "price",
                    "stockQuantity",
                    "createdAt");

    private static final int MAXIMUM_PAGE_SIZE = 100;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ProductResponse createProduct(
            ProductRequest request) {

        String normalizedName =
                request.getName().trim();

        if (productRepository
                .existsByNameIgnoreCase(
                        normalizedName)) {

            throw new ConflictException(
                    "Product already exists with name: "
                            + normalizedName);
        }

        Category category =
                findActiveCategory(
                        request.getCategoryId());

        Product product = new Product(
                normalizedName,
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity(),
                request.getImageUrl(),
                category
        );

        return mapToResponse(
                productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository
                .findAllByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse>
            getAllProductsForAdmin() {

        return productRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductResponseById(
            Long id) {

        Product product = productRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(id));

        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductByIdForAdmin(
            Long id) {

        return mapToResponse(
                findProductForAdmin(id));
    }

    @Transactional
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request) {

        Product product =
                findProductForAdmin(id);

        String normalizedName =
                request.getName().trim();

        boolean duplicateName =
                productRepository
                        .existsByNameIgnoreCaseAndIdNot(
                                normalizedName,
                                id);

        if (duplicateName) {
            throw new ConflictException(
                    "Product already exists with name: "
                            + normalizedName);
        }

        Category category =
                findActiveCategory(
                        request.getCategoryId());

        product.setName(normalizedName);
        product.setDescription(
                request.getDescription());
        product.setPrice(
                request.getPrice());
        product.setStockQuantity(
                request.getStockQuantity());
        product.setImageUrl(
                request.getImageUrl());
        product.setCategory(category);

        return mapToResponse(
                productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {

        Product product =
                findProductForAdmin(id);

        product.setActive(false);

        productRepository.save(product);
    }

    @Transactional
    public ProductResponse activateProduct(Long id) {

        Product product =
                findProductForAdmin(id);

        product.setActive(true);

        return mapToResponse(
                productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse>
            getProductsByCategory(
                    Long categoryId) {

        findActiveCategory(categoryId);

        return productRepository
                .findAllByCategoryIdAndActiveTrueOrderByNameAsc(
                        categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(
            int page,
            int size,
            String sortBy,
            String direction) {

        if (page < 0) {
            throw new BadRequestException(
                    "Page number cannot be negative");
        }

        if (size <= 0 || size > MAXIMUM_PAGE_SIZE) {
            throw new BadRequestException(
                    "Page size must be between 1 and "
                            + MAXIMUM_PAGE_SIZE);
        }

        String validatedSortField =
                validateSortField(sortBy);

        Sort.Direction sortDirection =
                "desc".equalsIgnoreCase(direction)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        sortDirection,
                        validatedSortField));

        return productRepository
                .findAllByActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(
            String keyword) {

        if (keyword == null
                || keyword.trim().length() < 2) {

            throw new BadRequestException(
                    "Search keyword must contain at least 2 characters");
        }

        return productRepository
                .findAllByNameContainingIgnoreCaseAndActiveTrue(
                        keyword.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private String validateSortField(
            String sortBy) {

        String requestedField =
                sortBy == null || sortBy.isBlank()
                        ? "createdAt"
                        : sortBy.trim();

        if (!ALLOWED_SORT_FIELDS
                .contains(requestedField)) {

            throw new BadRequestException(
                    "Invalid product sort field");
        }

        return requestedField;
    }

    private Product findProductForAdmin(Long id) {

        return productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(id));
    }

    private Category findActiveCategory(Long id) {

        return categoryRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(id));
    }

    private ProductResponse mapToResponse(
            Product product) {

        Category category =
                product.getCategory();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                category.getId(),
                category.getName(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}