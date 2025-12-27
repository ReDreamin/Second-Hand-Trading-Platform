package com.secondhand.platform.service;

import com.secondhand.platform.dto.*;
import com.secondhand.platform.entity.Product;
import com.secondhand.platform.entity.ProductImage;
import com.secondhand.platform.exception.BusinessException;
import com.secondhand.platform.repository.ProductImageRepository;
import com.secondhand.platform.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Transactional
    public ProductResponse createProduct(Long sellerId, ProductCreateRequest request) {
        // 使用第一张图片作为封面
        String coverUrl = request.getImages() != null && !request.getImages().isEmpty()
                ? request.getImages().get(0)
                : "";

        // 将分类字符串映射为分类ID
        Integer categoryId = mapCategoryToId(request.getCategory());

        Product product = Product.builder()
                .sellerId(sellerId)
                .title(request.getName())
                .coverUrl(coverUrl)
                .description(request.getDescription())
                .price(request.getPrice())
                .categoryId(categoryId)
                .condition((short) 9)
                .status((short) 1)
                .viewCount(0)
                .build();

        product = productRepository.save(product);

        // Save images
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            saveProductImages(product.getId(), request.getImages());
        }

        return getProductById(product.getId());
    }

    private Integer mapCategoryToId(String category) {
        if (category == null) return null;
        return switch (category) {
            case "clothing" -> 1;
            case "electronics" -> 2;
            case "shoes" -> 3;
            case "study" -> 4;
            case "daily" -> 5;
            case "sports" -> 6;
            case "books" -> 7;
            case "other" -> 8;
            default -> null;
        };
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, Long sellerId, ProductUpdateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(404, "Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new BusinessException(403, "You can only update your own products");
        }

        if (product.getStatus() == -1) {
            throw new BusinessException(400, "Cannot update a deleted product");
        }

        if (StringUtils.hasText(request.getTitle())) {
            product.setTitle(request.getTitle());
        }
        if (StringUtils.hasText(request.getCoverUrl())) {
            product.setCoverUrl(request.getCoverUrl());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getCategoryId() != null) {
            product.setCategoryId(request.getCategoryId());
        }
        if (request.getCondition() != null) {
            product.setCondition(request.getCondition());
        }
        if (request.getLocation() != null) {
            product.setLocation(request.getLocation());
        }

        productRepository.save(product);

        // Update images if provided
        if (request.getImageUrls() != null) {
            productImageRepository.deleteByProductId(productId);
            if (!request.getImageUrls().isEmpty()) {
                saveProductImages(productId, request.getImageUrls());
            }
        }

        return getProductById(productId);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findByIdWithAllDetails(productId)
                .orElseThrow(() -> new BusinessException(404, "Product not found"));

        return ProductResponse.fromEntity(product);
    }

    @Transactional
    public ProductResponse getProductByIdAndIncrementView(Long productId) {
        productRepository.incrementViewCount(productId);
        return getProductById(productId);
    }

    @Transactional
    public void deleteProduct(Long productId, Long sellerId) {
        int updated = productRepository.updateStatus(productId, sellerId, (short) -1);
        if (updated == 0) {
            throw new BusinessException(404, "Product not found or you don't have permission");
        }
    }

    @Transactional
    public void updateProductStatus(Long productId, Long sellerId, Short status) {
        if (status < -1 || status > 2) {
            throw new BusinessException(400, "Invalid status value");
        }

        int updated = productRepository.updateStatus(productId, sellerId, status);
        if (updated == 0) {
            throw new BusinessException(404, "Product not found or you don't have permission");
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductListResponse> searchProducts(ProductSearchRequest request) {
        Sort sort = createSort(request.getSortBy(), request.getSortOrder());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Specification<Product> spec = createSearchSpecification(request);
        Page<Product> page = productRepository.findAll(spec, pageable);

        return PageResponse.from(page, ProductListResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductListResponse> getMyProducts(Long sellerId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = productRepository.findBySellerIdAndStatusNot(sellerId, (short) -1, pageable);
        return PageResponse.from(productPage, ProductListResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ProductPageResponse getProducts(Integer page, Integer pageSize, String keyword, String category) {
        // 转换为0-based page
        int pageIndex = Math.max(0, page - 1);
        Integer categoryId = mapCategoryToId(category);

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Product> productPage;
        if (StringUtils.hasText(keyword) || categoryId != null) {
            ProductSearchRequest searchRequest = new ProductSearchRequest();
            searchRequest.setKeyword(keyword);
            searchRequest.setCategoryId(categoryId);
            searchRequest.setPage(pageIndex);
            searchRequest.setSize(pageSize);
            Specification<Product> spec = createSearchSpecification(searchRequest);
            productPage = productRepository.findAll(spec, pageable);
        } else {
            productPage = productRepository.findByStatus((short) 1, pageable);
        }

        List<ProductItemResponse> list = productPage.getContent().stream()
                .map(ProductItemResponse::fromEntity)
                .toList();

        return ProductPageResponse.builder()
                .list(list)
                .total(productPage.getTotalElements())
                .page(page)
                .pageSize(pageSize)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getLatestProducts(int limit) {
        return productRepository.findTop10ByStatusOrderByCreatedAtDesc((short) 1)
                .stream()
                .map(ProductListResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getHotProducts(int limit) {
        return productRepository.findTop10ByStatusOrderByViewCountDesc((short) 1)
                .stream()
                .map(ProductListResponse::fromEntity)
                .toList();
    }

    private void saveProductImages(Long productId, List<String> imageUrls) {
        List<ProductImage> images = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage image = ProductImage.builder()
                    .productId(productId)
                    .imageUrl(imageUrls.get(i))
                    .sortOrder(i)
                    .build();
            images.add(image);
        }
        productImageRepository.saveAll(images);
    }

    private Sort createSort(String sortBy, String sortOrder) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String field = switch (sortBy) {
            case "price" -> "price";
            case "viewCount" -> "viewCount";
            default -> "createdAt";
        };

        return Sort.by(direction, field);
    }

    private Specification<Product> createSearchSpecification(ProductSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only show active products
            predicates.add(cb.equal(root.get("status"), (short) 1));

            // Keyword search
            if (StringUtils.hasText(request.getKeyword())) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), keyword);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), keyword);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            // Category filter
            if (request.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("categoryId"), request.getCategoryId()));
            }

            // Price range
            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.getMaxPrice()));
            }

            // Condition filter
            if (request.getCondition() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("condition"), request.getCondition()));
            }

            // Location filter
            if (StringUtils.hasText(request.getLocation())) {
                predicates.add(cb.like(root.get("location"), "%" + request.getLocation() + "%"));
            }

            // Fetch associations for list response
            if (query != null && query.getResultType().equals(Product.class)) {
                root.fetch("seller", jakarta.persistence.criteria.JoinType.LEFT);
                root.fetch("category", jakarta.persistence.criteria.JoinType.LEFT);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
