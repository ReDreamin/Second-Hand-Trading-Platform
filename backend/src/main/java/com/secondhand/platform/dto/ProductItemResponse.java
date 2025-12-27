package com.secondhand.platform.dto;

import com.secondhand.platform.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductItemResponse {
    private Long id;
    private String name;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private List<String> images;
    private Long sellerId;
    private String sellerName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductItemResponse fromEntity(Product product) {
        String categoryStr = mapCategoryIdToString(product.getCategoryId());
        String statusStr = mapStatusToString(product.getStatus());

        List<String> imageList = List.of(product.getCoverUrl() != null ? product.getCoverUrl() : "");

        return ProductItemResponse.builder()
                .id(product.getId())
                .name(product.getTitle())
                .category(categoryStr)
                .price(product.getPrice())
                .stock(1)
                .description(product.getDescription())
                .images(imageList)
                .sellerId(product.getSellerId())
                .sellerName(product.getSeller() != null ? product.getSeller().getUsername() : "未知用户")
                .status(statusStr)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private static String mapCategoryIdToString(Integer categoryId) {
        if (categoryId == null) return "other";
        return switch (categoryId) {
            case 1 -> "clothing";
            case 2 -> "electronics";
            case 3 -> "shoes";
            case 4 -> "study";
            case 5 -> "daily";
            case 6 -> "sports";
            case 7 -> "books";
            default -> "other";
        };
    }

    private static String mapStatusToString(Short status) {
        if (status == null) return "on_sale";
        return switch (status) {
            case 1 -> "on_sale";
            case 0 -> "off_sale";
            case 2 -> "sold_out";
            default -> "off_sale";
        };
    }
}
