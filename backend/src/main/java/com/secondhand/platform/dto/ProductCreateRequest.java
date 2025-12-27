package com.secondhand.platform.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "商品名称不能为空")
    @Size(max = 128, message = "商品名称不能超过128个字符")
    private String name;

    private String description;

    @NotNull(message = "价格不能为空")
    @DecimalMin(value = "0.01", message = "价格必须大于0")
    @Digits(integer = 8, fraction = 2, message = "价格格式不正确")
    private BigDecimal price;

    private String category;

    @Min(value = 1, message = "库存必须大于0")
    private Integer stock = 1;

    @NotEmpty(message = "请至少上传一张商品图片")
    private List<String> images;
}
