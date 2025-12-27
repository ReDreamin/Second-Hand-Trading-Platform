package com.secondhand.platform.repository;

import com.secondhand.platform.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller LEFT JOIN FETCH p.category LEFT JOIN FETCH p.images WHERE p.id = :id")
    Optional<Product> findByIdWithAllDetails(@Param("id") Long id);

    Page<Product> findBySellerIdAndStatusNot(Long sellerId, Short status, Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    Page<Product> findByStatus(Short status, Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.seller WHERE p.status = :status")
    Page<Product> findByStatusWithSeller(@Param("status") Short status, Pageable pageable);

    Page<Product> findByCategoryIdAndStatus(Integer categoryId, Short status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 1 AND " +
           "(LOWER(p.searchText) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query(value = "SELECT * FROM products WHERE status = 1 AND " +
                   "search_text ILIKE '%' || :keyword || '%'",
           countQuery = "SELECT COUNT(*) FROM products WHERE status = 1 AND " +
                        "search_text ILIKE '%' || :keyword || '%'",
           nativeQuery = true)
    Page<Product> searchByKeywordNative(@Param("keyword") String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Product p SET p.status = :status WHERE p.id = :id AND p.sellerId = :sellerId")
    int updateStatus(@Param("id") Long id, @Param("sellerId") Long sellerId, @Param("status") Short status);

    List<Product> findTop10ByStatusOrderByCreatedAtDesc(Short status);

    List<Product> findTop10ByStatusOrderByViewCountDesc(Short status);
}
