package com.secondhand.platform.service;

import com.secondhand.platform.dto.CreateOrderRequest;
import com.secondhand.platform.dto.OrderResponse;
import com.secondhand.platform.dto.PageResponse;
import com.secondhand.platform.entity.Order;
import com.secondhand.platform.entity.Product;
import com.secondhand.platform.exception.BusinessException;
import com.secondhand.platform.repository.OrderRepository;
import com.secondhand.platform.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    /**
     * 创建订单
     */
    @Transactional
    public OrderResponse createOrder(Long buyerId, CreateOrderRequest request) {
        // 查询商品
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException(404, "商品不存在"));

        // 检查商品状态
        if (product.getStatus() != 1) {
            throw new BusinessException(400, "商品已下架或已售出");
        }

        // 不能购买自己的商品
        if (product.getSellerId().equals(buyerId)) {
            throw new BusinessException(400, "不能购买自己的商品");
        }

        // 检查是否有未完成的订单
        List<Short> activeStatuses = List.of(Order.STATUS_PENDING, Order.STATUS_PAID, Order.STATUS_SHIPPED);
        if (orderRepository.existsByProductIdAndStatusIn(request.getProductId(), activeStatuses)) {
            throw new BusinessException(400, "该商品已有进行中的订单");
        }

        // 生成订单号
        String orderNo = generateOrderNo();

        // 计算总金额
        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        BigDecimal totalAmount = product.getPrice().multiply(BigDecimal.valueOf(quantity));

        // 创建订单
        Order order = Order.builder()
                .orderNo(orderNo)
                .productId(product.getId())
                .buyerId(buyerId)
                .sellerId(product.getSellerId())
                .productTitle(product.getTitle())
                .productImage(product.getCoverUrl())
                .productPrice(product.getPrice())
                .quantity(quantity)
                .totalAmount(totalAmount)
                .status(Order.STATUS_PENDING)
                .buyerRemark(request.getRemark())
                .build();

        order = orderRepository.save(order);

        return OrderResponse.fromEntitySimple(order);
    }

    /**
     * 获取买家订单列表（购买记录）
     */
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getBuyerOrders(Long buyerId, Integer page, Integer pageSize, String status) {
        int pageIndex = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageIndex, pageSize);

        Page<Order> orderPage;
        if (status != null && !status.equals("all")) {
            Short statusCode = Order.parseStatus(status);
            orderPage = orderRepository.findByBuyerIdAndStatusOrderByCreatedAtDesc(buyerId, statusCode, pageable);
        } else {
            orderPage = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId, pageable);
        }

        return PageResponse.from(orderPage, OrderResponse::fromEntitySimple);
    }

    /**
     * 获取卖家订单列表（销售记录）
     */
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getSellerOrders(Long sellerId, Integer page, Integer pageSize, String status) {
        int pageIndex = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageIndex, pageSize);

        Page<Order> orderPage;
        if (status != null && !status.equals("all")) {
            Short statusCode = Order.parseStatus(status);
            orderPage = orderRepository.findBySellerIdAndStatusOrderByCreatedAtDesc(sellerId, statusCode, pageable);
        } else {
            orderPage = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        }

        return PageResponse.from(orderPage, OrderResponse::fromEntitySimple);
    }

    /**
     * 获取订单详情
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(Long orderId, Long userId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));

        // 只有买家或卖家可以查看订单
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new BusinessException(403, "无权查看此订单");
        }

        return OrderResponse.fromEntity(order);
    }

    /**
     * 支付订单
     */
    @Transactional
    public OrderResponse payOrder(Long orderId, Long buyerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));

        // 验证买家
        if (!order.getBuyerId().equals(buyerId)) {
            throw new BusinessException(403, "无权操作此订单");
        }

        // 验证状态
        if (order.getStatus() != Order.STATUS_PENDING) {
            throw new BusinessException(400, "订单状态不正确");
        }

        // 更新订单状态
        order.setStatus(Order.STATUS_PAID);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);

        // 更新商品状态为已售出
        productRepository.updateStatus(order.getProductId(), order.getSellerId(), (short) 2);

        return OrderResponse.fromEntitySimple(order);
    }

    /**
     * 发货
     */
    @Transactional
    public OrderResponse shipOrder(Long orderId, Long sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));

        // 验证卖家
        if (!order.getSellerId().equals(sellerId)) {
            throw new BusinessException(403, "无权操作此订单");
        }

        // 验证状态
        if (order.getStatus() != Order.STATUS_PAID) {
            throw new BusinessException(400, "订单状态不正确，只有已支付订单可以发货");
        }

        // 更新订单状态
        order.setStatus(Order.STATUS_SHIPPED);
        order.setShippedAt(LocalDateTime.now());
        orderRepository.save(order);

        return OrderResponse.fromEntitySimple(order);
    }

    /**
     * 确认收货
     */
    @Transactional
    public OrderResponse completeOrder(Long orderId, Long buyerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));

        // 验证买家
        if (!order.getBuyerId().equals(buyerId)) {
            throw new BusinessException(403, "无权操作此订单");
        }

        // 验证状态
        if (order.getStatus() != Order.STATUS_SHIPPED) {
            throw new BusinessException(400, "订单状态不正确，只有已发货订单可以确认收货");
        }

        // 更新订单状态
        order.setStatus(Order.STATUS_COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        orderRepository.save(order);

        return OrderResponse.fromEntitySimple(order);
    }

    /**
     * 取消订单
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));

        // 验证用户（买家或卖家都可以取消）
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new BusinessException(403, "无权操作此订单");
        }

        // 只有待支付状态可以取消
        if (order.getStatus() != Order.STATUS_PENDING) {
            throw new BusinessException(400, "只有待支付订单可以取消");
        }

        // 更新订单状态
        order.setStatus(Order.STATUS_CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        return OrderResponse.fromEntitySimple(order);
    }

    /**
     * 生成订单号
     */
    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "ORD" + timestamp + uuid;
    }
}
