package com.inventory.management.repository;

import com.inventory.management.entity.StockTransaction;
import com.inventory.management.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByProductId(Long productId);

    List<StockTransaction> findByType(TransactionType type);

    List<StockTransaction> findByPerformedById(Long userId);

    List<StockTransaction> findByTransactionDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT st FROM StockTransaction st WHERE st.type = :type AND st.transactionDate BETWEEN :start AND :end")
    List<StockTransaction> findByTypeAndDateRange(
            @Param("type") TransactionType type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT st FROM StockTransaction st ORDER BY st.transactionDate DESC")
    List<StockTransaction> findRecentTransactions();
}
