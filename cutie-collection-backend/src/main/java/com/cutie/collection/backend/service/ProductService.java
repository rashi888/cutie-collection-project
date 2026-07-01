package com.cutie.collection.backend.service; 

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.ProductRequest;
import com.cutie.collection.backend.dto.ProductResponse;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.repository.CategoryRepository;
import com.cutie.collection.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;


@Service
@Transactional
public class ProductService {
	
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // CREATE PRODUCT
    public ProductResponse createProduct(ProductRequest request) {

        if (productRepository.existsByName(request.getName())) {
            throw new RuntimeException(
                    "Product already exists with name: "
                            + request.getName());
        }

        Category category = categoryRepository.findById(
                request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: "
                                        + request.getCategoryId()));

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        return mapToResponse(savedProduct);
    }

    // GET ALL PRODUCTS
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET PRODUCT BY ID
    public ProductResponse getProductById(Long id) {

        Product product = findProductById(id);

        return mapToResponse(product);
    }

    // UPDATE PRODUCT
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request) {

        Product product = findProductById(id);

        Category category = categoryRepository.findById(
                request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: "
                                        + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(updatedProduct);
    }

    // DELETE PRODUCT
    public void deleteProduct(Long id) {

        Product product = findProductById(id);

        productRepository.delete(product);
    }

    // GET PRODUCTS BY CATEGORY
    public List<ProductResponse> getProductsByCategory(
            Long categoryId) {

        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // COMMON METHOD
    private Product findProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: "
                                        + id));
    }

    // ENTITY -> DTO
    private ProductResponse mapToResponse(Product product) {

        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setImageUrl(product.getImageUrl());

        response.setCategoryId(
                product.getCategory().getId());

        response.setCategoryName(
                product.getCategory().getName());

        response.setCreatedAt(
                product.getCreatedAt());

        response.setUpdatedAt(
                product.getUpdatedAt());

        return response;
    }
    
    public Page<ProductResponse> getProducts(
            int page,
            int size,
            String sortBy,
            String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort);

        return productRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }
    
    public List<ProductResponse> searchProducts(
            String keyword) {

        return productRepository
                .findByNameContainingIgnoreCase(
                        keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}
