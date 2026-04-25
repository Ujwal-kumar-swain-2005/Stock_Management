package com.inventory.management.service;

import com.inventory.management.dto.DashboardStats;
import com.inventory.management.entity.Inventory;
import com.inventory.management.entity.StockTransaction;
import com.inventory.management.enums.OrderType;
import com.inventory.management.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final StockTransactionRepository transactionRepository;

    public DashboardService(ProductRepository productRepository, CategoryRepository categoryRepository,
                            SupplierRepository supplierRepository, OrderRepository orderRepository,
                            InventoryRepository inventoryRepository, StockTransactionRepository transactionRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
    }

    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();

        stats.setTotalProducts(productRepository.countByActiveTrue());
        stats.setTotalCategories(categoryRepository.countByActiveTrue());
        stats.setTotalSuppliers(supplierRepository.countByActiveTrue());
        stats.setTotalOrders(orderRepository.count());
        stats.setLowStockItems(inventoryRepository.countLowStockItems());
        stats.setOutOfStockItems(inventoryRepository.countOutOfStockItems());

        Double inventoryValue = inventoryRepository.calculateTotalInventoryValue();
        stats.setTotalInventoryValue(inventoryValue != null ? inventoryValue : 0.0);

        // Current month sales and purchases
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime now = LocalDateTime.now();

        Double sales = orderRepository.sumTotalByTypeAndDateRange(OrderType.SALES, startOfMonth, now);
        stats.setTotalSales(sales != null ? sales : 0.0);

        Double purchases = orderRepository.sumTotalByTypeAndDateRange(OrderType.PURCHASE, startOfMonth, now);
        stats.setTotalPurchases(purchases != null ? purchases : 0.0);

        // Recent transactions
        List<StockTransaction> recent = transactionRepository.findRecentTransactions();
        List<Map<String, Object>> recentList = recent.stream().limit(10).map(t -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", t.getId());
            map.put("productName", t.getProduct().getName());
            map.put("type", t.getType().name());
            map.put("quantity", t.getQuantity());
            map.put("date", t.getTransactionDate().toString());
            map.put("performedBy", t.getPerformedBy() != null ? t.getPerformedBy().getFullName() : "System");
            return map;
        }).collect(Collectors.toList());
        stats.setRecentTransactions(recentList);

        // Low stock products
        List<Inventory> lowStock = inventoryRepository.findLowStockItems();
        List<Map<String, Object>> lowStockList = lowStock.stream().limit(10).map(i -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", i.getProduct().getId());
            map.put("name", i.getProduct().getName());
            map.put("sku", i.getProduct().getSku());
            map.put("quantity", i.getQuantity());
            map.put("reorderLevel", i.getProduct().getReorderLevel());
            return map;
        }).collect(Collectors.toList());
        stats.setLowStockProducts(lowStockList);

        // Monthly sales data (last 6 months)
        List<Map<String, Object>> monthlySales = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).with(LocalTime.MIN);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

            Double monthSales = orderRepository.sumTotalByTypeAndDateRange(OrderType.SALES, monthStart, monthEnd);
            Double monthPurchases = orderRepository.sumTotalByTypeAndDateRange(OrderType.PURCHASE, monthStart, monthEnd);

            Map<String, Object> monthData = new LinkedHashMap<>();
            monthData.put("month", monthStart.getMonth().toString().substring(0, 3));
            monthData.put("amount", monthSales != null ? monthSales : 0.0);
            monthData.put("purchases", monthPurchases != null ? monthPurchases : 0.0);
            monthlySales.add(monthData);
        }
        stats.setMonthlySales(monthlySales);

        return stats;
    }
}
