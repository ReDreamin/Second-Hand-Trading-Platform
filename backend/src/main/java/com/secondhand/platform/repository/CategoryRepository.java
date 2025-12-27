package com.secondhand.platform.repository;

import com.secondhand.platform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    List<Category> findByParentIdIsNullOrderBySortOrder();

    List<Category> findByParentIdOrderBySortOrder(Integer parentId);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parentId IS NULL ORDER BY c.sortOrder")
    List<Category> findAllWithChildren();
}
