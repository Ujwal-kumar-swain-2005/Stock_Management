package com.inventory.management.repository;

import com.inventory.management.entity.Order;
import com.inventory.management.enums.OrderStatus;
import com.inventory.management.enums.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByOrderType(OrderType orderType);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCreatedById(Long userId);

    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.orderType = :type AND o.orderDate BETWEEN :start AND :end")
    List<Order> findByTypeAndDateRange(
            @Param("type") OrderType type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderType = :type AND o.status != 'CANCELLED' AND o.orderDate BETWEEN :start AND :end")
    Double sumTotalByTypeAndDateRange(
            @Param("type") OrderType type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderType = :type AND o.orderDate BETWEEN :start AND :end")
    long countByTypeAndDateRange(
            @Param("type") OrderType type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
