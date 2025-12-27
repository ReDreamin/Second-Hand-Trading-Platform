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

    @NotBlank(message = "Title is required")
    @Size(max = 128, message = "Title must not exceed 128 characters")
    private String title;

    @NotBlank(message = "Cover image is required")
    private String coverUrl;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid price format")
    private BigDecimal price;

    @Digits(integer = 8, fraction = 2, message = "Invalid original price format")
    private BigDecimal originalPrice;

    private Integer categoryId;

    @Min(value = 1, message = "Condition must be between 1 and 10")
    @Max(value = 10, message = "Condition must be between 1 and 10")
    private Short condition = 9;

    @Size(max = 128, message = "Location must not exceed 128 characters")
    private String location;

    private List<String> imageUrls;
}
