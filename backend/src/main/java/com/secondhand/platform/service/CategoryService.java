package com.secondhand.platform.service;

import com.secondhand.platform.dto.CategoryResponse;
import com.secondhand.platform.entity.Category;
import com.secondhand.platform.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<Category> rootCategories = categoryRepository.findByParentIdIsNullOrderBySortOrder();
        return rootCategories.stream()
                .map(this::buildCategoryTree)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIdIsNullOrderBySortOrder()
                .stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getSubCategories(Integer parentId) {
        return categoryRepository.findByParentIdOrderBySortOrder(parentId)
                .stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    private CategoryResponse buildCategoryTree(Category category) {
        List<Category> children = categoryRepository.findByParentIdOrderBySortOrder(category.getId());

        List<CategoryResponse> childResponses = null;
        if (!children.isEmpty()) {
            childResponses = children.stream()
                    .map(this::buildCategoryTree)
                    .toList();
        }

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParentId())
                .icon(category.getIcon())
                .sortOrder(category.getSortOrder())
                .children(childResponses)
                .build();
    }
}
