package com.secondhand.platform.controller;

import com.secondhand.platform.dto.*;
import com.secondhand.platform.security.UserPrincipal;
import com.secondhand.platform.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ProductCreateRequest request) {
        ProductResponse response = productService.createProduct(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductResponse response = productService.updateProduct(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable Long id) {
        ProductResponse response = productService.getProductByIdAndIncrementView(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        productService.deleteProduct(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateProductStatus(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id,
            @RequestParam Short status) {
        productService.updateProductStatus(id, user.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Product status updated", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProductPageResponse>> getProducts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        ProductPageResponse response = productService.getProducts(page, pageSize, keyword, category);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<ProductListResponse>>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Short condition,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {

        ProductSearchRequest request = new ProductSearchRequest();
        request.setKeyword(keyword);
        request.setCategoryId(categoryId);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setCondition(condition);
        request.setLocation(location);
        request.setSortBy(sortBy);
        request.setSortOrder(sortOrder);
        request.setPage(page);
        request.setSize(size);

        PageResponse<ProductListResponse> response = productService.searchProducts(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<ProductPageResponse>> getMyProducts(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        ProductPageResponse response = productService.getMyProducts(user.getId(), page, pageSize);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getLatestProducts() {
        List<ProductListResponse> response = productService.getLatestProducts(10);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/hot")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getHotProducts() {
        List<ProductListResponse> response = productService.getHotProducts(10);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
