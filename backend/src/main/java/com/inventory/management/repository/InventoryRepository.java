package com.inventory.management.repository;

import com.inventory.management.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.product.reorderLevel")
    List<Inventory> findLowStockItems();

    @Query("SELECT SUM(i.quantity * i.product.price) FROM Inventory i WHERE i.product.active = true")
    Double calculateTotalInventoryValue();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity <= i.product.reorderLevel")
    long countLowStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity = 0")
    long countOutOfStockItems();
}
