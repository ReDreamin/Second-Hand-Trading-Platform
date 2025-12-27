package com.secondhand.platform.dto;

import com.secondhand.platform.entity.Product;
import com.secondhand.platform.entity.ProductImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private Long sellerId;
    private String sellerName;
    private String sellerAvatar;

    private String title;
    private String coverUrl;
    private String description;

    private BigDecimal price;
    private BigDecimal originalPrice;

    private Integer categoryId;
    private String categoryName;

    private Short condition;
    private Short status;
    private String location;
    private Integer viewCount;

    private List<String> imageUrls;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse fromEntity(Product product) {
        ProductResponseBuilder builder = ProductResponse.builder()
                .id(product.getId())
                .sellerId(product.getSellerId())
                .title(product.getTitle())
                .coverUrl(product.getCoverUrl())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .categoryId(product.getCategoryId())
                .condition(product.getCondition())
                .status(product.getStatus())
                .location(product.getLocation())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt());

        if (product.getSeller() != null) {
            builder.sellerName(product.getSeller().getUsername());
        }

        if (product.getCategory() != null) {
            builder.categoryName(product.getCategory().getName());
        }

        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<String> urls = product.getImages().stream()
                    .sorted(Comparator.comparingInt(ProductImage::getSortOrder))
                    .map(ProductImage::getImageUrl)
                    .toList();
            builder.imageUrls(urls);
        } else {
            builder.imageUrls(Collections.emptyList());
        }

        return builder.build();
    }
}
