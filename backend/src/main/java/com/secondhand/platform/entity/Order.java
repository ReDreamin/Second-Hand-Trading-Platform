package com.secondhand.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 32)
    private String orderNo;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    // 商品快照
    @Column(name = "product_title", nullable = false, length = 128)
    private String productTitle;

    @Column(name = "product_image", nullable = false)
    private String productImage;

    @Column(name = "product_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal productPrice;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    @Builder.Default
    private Short status = 0;
    // 状态: 0=待支付(pending), 1=已支付(paid), 2=已发货(shipped), 3=已完成(completed), -1=已取消(cancelled)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "buyer_remark", columnDefinition = "TEXT")
    private String buyerRemark;

    @Column(name = "seller_remark", columnDefinition = "TEXT")
    private String sellerRemark;

    // 关联关系
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", insertable = false, updatable = false)
    private UserAccount buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", insertable = false, updatable = false)
    private UserAccount seller;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // 状态常量
    public static final short STATUS_PENDING = 0;
    public static final short STATUS_PAID = 1;
    public static final short STATUS_SHIPPED = 2;
    public static final short STATUS_COMPLETED = 3;
    public static final short STATUS_CANCELLED = -1;

    // 状态转换为字符串
    public String getStatusText() {
        if (status == null) return "unknown";
        return switch (status.intValue()) {
            case 0 -> "pending";
            case 1 -> "paid";
            case 2 -> "shipped";
            case 3 -> "completed";
            case -1 -> "cancelled";
            default -> "unknown";
        };
    }

    // 从字符串转换状态
    public static short parseStatus(String statusText) {
        return switch (statusText.toLowerCase()) {
            case "pending" -> STATUS_PENDING;
            case "paid" -> STATUS_PAID;
            case "shipped" -> STATUS_SHIPPED;
            case "completed" -> STATUS_COMPLETED;
            case "cancelled" -> STATUS_CANCELLED;
            default -> STATUS_PENDING;
        };
    }
}
