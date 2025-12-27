package com.secondhand.platform.controller;

import com.secondhand.platform.dto.ApiResponse;
import com.secondhand.platform.dto.CategoryResponse;
import com.secondhand.platform.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> response = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        List<CategoryResponse> response = categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getSubCategories(
            @PathVariable Integer parentId) {
        List<CategoryResponse> response = categoryService.getSubCategories(parentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
