package com.secondhand.platform.dto;

import com.secondhand.platform.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Integer id;
    private String name;
    private Integer parentId;
    private String icon;
    private Integer sortOrder;
    private List<CategoryResponse> children;

    public static CategoryResponse fromEntity(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParentId())
                .icon(category.getIcon())
                .sortOrder(category.getSortOrder())
                .build();
    }

    public static CategoryResponse fromEntityWithChildren(Category category) {
        CategoryResponseBuilder builder = CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParentId())
                .icon(category.getIcon())
                .sortOrder(category.getSortOrder());

        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            List<CategoryResponse> childResponses = category.getChildren().stream()
                    .map(CategoryResponse::fromEntityWithChildren)
                    .toList();
            builder.children(childResponses);
        }

        return builder.build();
    }
}
