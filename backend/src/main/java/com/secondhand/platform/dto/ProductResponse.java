package com.secondhand.platform.dto;

import com.secondhand.platform.entity.Product;
import com.secondhand.platform.entity.ProductImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

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

    public static ProductResponse fromEntity(Product product) {
        // 构建图片列表
        List<String> imageList = new ArrayList<>();
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            imageList = product.getImages().stream()
                    .sorted(Comparator.comparingInt(ProductImage::getSortOrder))
                    .map(ProductImage::getImageUrl)
                    .toList();
        } else if (product.getCoverUrl() != null) {
            imageList = List.of(product.getCoverUrl());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getTitle())
                .category(mapCategoryIdToString(product.getCategoryId()))
                .price(product.getPrice())
                .stock(1)
                .description(product.getDescription())
                .images(imageList)
                .sellerId(product.getSellerId())
                .sellerName(product.getSeller() != null ? product.getSeller().getUsername() : "未知用户")
                .status(mapStatusToString(product.getStatus()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private static String mapCategoryIdToString(Integer categoryId) {
        if (categoryId == null) return "other";
        return switch (categoryId) {
            case 1 -> "electronics";
            case 2 -> "clothing";
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
