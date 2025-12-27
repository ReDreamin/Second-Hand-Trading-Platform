package com.secondhand.platform.dto;

import com.secondhand.platform.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListResponse {

    private Long id;
    private Long sellerId;
    private String sellerName;

    private String title;
    private String coverUrl;

    private BigDecimal price;
    private BigDecimal originalPrice;

    private String categoryName;
    private Short condition;
    private Short status;
    private String location;
    private Integer viewCount;

    private LocalDateTime createdAt;

    public static ProductListResponse fromEntity(Product product) {
        ProductListResponseBuilder builder = ProductListResponse.builder()
                .id(product.getId())
                .sellerId(product.getSellerId())
                .title(product.getTitle())
                .coverUrl(product.getCoverUrl())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .condition(product.getCondition())
                .status(product.getStatus())
                .location(product.getLocation())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt());

        if (product.getSeller() != null) {
            builder.sellerName(product.getSeller().getUsername());
        }

        if (product.getCategory() != null) {
            builder.categoryName(product.getCategory().getName());
        }

        return builder.build();
    }
}
