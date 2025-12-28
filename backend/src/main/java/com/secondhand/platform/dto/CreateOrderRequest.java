package com.secondhand.platform.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotNull(message = "商品ID不能为空")
    private Long productId;

    @Min(value = 1, message = "购买数量至少为1")
    @Builder.Default
    private Integer quantity = 1;

    private String remark;
}
