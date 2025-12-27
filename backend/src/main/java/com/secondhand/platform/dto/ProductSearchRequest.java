package com.secondhand.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchRequest {

    private String keyword;
    private Integer categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Short condition;
    private String location;
    private String sortBy = "createdAt";  // createdAt, price, viewCount
    private String sortOrder = "desc";     // asc, desc
    private Integer page = 0;
    private Integer size = 20;
}
