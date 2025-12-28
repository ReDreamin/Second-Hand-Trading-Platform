package com.secondhand.platform.dto;

import com.secondhand.platform.entity.Order;
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
public class OrderResponse {

    private Long id;
    private String orderNo;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalAmount;
    private String status;
    private Long buyerId;
    private Long sellerId;
    private String buyerName;
    private String sellerName;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String buyerRemark;
    private String sellerRemark;

    public static OrderResponse fromEntity(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .productId(order.getProductId())
                .productName(order.getProductTitle())
                .productImage(order.getProductImage())
                .price(order.getProductPrice())
                .quantity(order.getQuantity())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatusText())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .buyerName(order.getBuyer() != null ? order.getBuyer().getUsername() : null)
                .sellerName(order.getSeller() != null ? order.getSeller().getUsername() : null)
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .shippedAt(order.getShippedAt())
                .completedAt(order.getCompletedAt())
                .cancelledAt(order.getCancelledAt())
                .buyerRemark(order.getBuyerRemark())
                .sellerRemark(order.getSellerRemark())
                .build();
    }

    public static OrderResponse fromEntitySimple(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .productId(order.getProductId())
                .productName(order.getProductTitle())
                .productImage(order.getProductImage())
                .price(order.getProductPrice())
                .quantity(order.getQuantity())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatusText())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .build();
    }
}
