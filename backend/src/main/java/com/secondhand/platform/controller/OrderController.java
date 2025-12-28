package com.secondhand.platform.controller;

import com.secondhand.platform.dto.*;
import com.secondhand.platform.security.UserPrincipal;
import com.secondhand.platform.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 创建订单
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("订单创建成功", response));
    }

    /**
     * 获取我的购买订单列表
     */
    @PostMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status) {
        PageResponse<OrderResponse> response = orderService.getBuyerOrders(user.getId(), page, pageSize, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取我的购买订单列表 (GET方式)
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrdersGet(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status) {
        PageResponse<OrderResponse> response = orderService.getBuyerOrders(user.getId(), page, pageSize, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取我的销售订单列表
     */
    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMySalesOrders(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status) {
        PageResponse<OrderResponse> response = orderService.getSellerOrders(user.getId(), page, pageSize, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        OrderResponse response = orderService.getOrderDetail(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 支付订单
     */
    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<OrderResponse>> payOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody PayOrderRequest request) {
        OrderResponse response = orderService.payOrder(request.getOrderId(), user.getId());
        return ResponseEntity.ok(ApiResponse.success("支付成功", response));
    }

    /**
     * 发货
     */
    @PostMapping("/{id}/ship")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        OrderResponse response = orderService.shipOrder(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("发货成功", response));
    }

    /**
     * 确认收货
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<OrderResponse>> completeOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        OrderResponse response = orderService.completeOrder(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("确认收货成功", response));
    }

    /**
     * 取消订单
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("订单已取消", response));
    }
}
