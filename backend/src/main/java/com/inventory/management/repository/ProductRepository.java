package com.inventory.management.repository;

import com.inventory.management.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    @EntityGraph(attributePaths = {"category", "supplier"})
    List<Product> findAll();

    @EntityGraph(attributePaths = {"category", "supplier"})
    Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = {"category", "supplier"})
    List<Product> findByActiveTrue();

    long countByActiveTrue();

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findBySupplierId(Long supplierId);

    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE p.expiryDate IS NOT NULL AND p.expiryDate <= :date AND p.active = true")
    List<Product> findExpiringProducts(@Param("date") LocalDate date);

    @Query("SELECT p FROM Product p JOIN Inventory i ON i.product = p WHERE i.quantity <= p.reorderLevel AND p.active = true")
    List<Product> findLowStockProducts();
}
