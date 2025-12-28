package com.secondhand.platform.repository;

import com.secondhand.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // 根据订单号查询
    Optional<Order> findByOrderNo(String orderNo);

    // 买家订单列表
    Page<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

    // 买家订单列表（按状态筛选）
    Page<Order> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, Short status, Pageable pageable);

    // 卖家订单列表
    Page<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);

    // 卖家订单列表（按状态筛选）
    Page<Order> findBySellerIdAndStatusOrderByCreatedAtDesc(Long sellerId, Short status, Pageable pageable);

    // 查询订单详情（带关联）
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.buyer LEFT JOIN FETCH o.seller WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Long id);

    // 检查商品是否有未完成的订单
    boolean existsByProductIdAndStatusIn(Long productId, java.util.List<Short> statuses);

    // 统计买家订单数量
    long countByBuyerId(Long buyerId);

    // 统计卖家订单数量
    long countBySellerId(Long sellerId);
}
