package com.inventory.management.service;

import com.inventory.management.entity.Inventory;
import com.inventory.management.entity.Product;
import com.inventory.management.entity.StockTransaction;
import com.inventory.management.enums.OrderType;
import com.inventory.management.enums.TransactionType;
import com.inventory.management.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;

    public ReportService(OrderRepository orderRepository, InventoryRepository inventoryRepository,
                         ProductRepository productRepository, StockTransactionRepository transactionRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
    }

    public Map<String, Object> getSalesReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Map<String, Object> report = new LinkedHashMap<>();
        Double totalSales = orderRepository.sumTotalByTypeAndDateRange(OrderType.SALES, start, end);
        long totalOrders = orderRepository.countByTypeAndDateRange(OrderType.SALES, start, end);

        report.put("totalSales", totalSales != null ? totalSales : 0.0);
        report.put("totalOrders", totalOrders);
        report.put("startDate", startDate.toString());
        report.put("endDate", endDate.toString());

        List<StockTransaction> transactions = transactionRepository
                .findByTypeAndDateRange(TransactionType.OUT, start, end);

        Map<String, Integer> productSales = new LinkedHashMap<>();
        for (StockTransaction t : transactions) {
            String name = t.getProduct().getName();
            productSales.put(name, productSales.getOrDefault(name, 0) + t.getQuantity());
        }

        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("product", e.getKey());
                    map.put("quantitySold", e.getValue());
                    return map;
                }).collect(Collectors.toList());

        report.put("topSellingProducts", topProducts);
        return report;
    }

    public Map<String, Object> getPurchaseReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Map<String, Object> report = new LinkedHashMap<>();
        Double totalPurchases = orderRepository.sumTotalByTypeAndDateRange(OrderType.PURCHASE, start, end);
        long totalOrders = orderRepository.countByTypeAndDateRange(OrderType.PURCHASE, start, end);

        report.put("totalPurchases", totalPurchases != null ? totalPurchases : 0.0);
        report.put("totalOrders", totalOrders);
        report.put("startDate", startDate.toString());
        report.put("endDate", endDate.toString());

        return report;
    }

    public Map<String, Object> getInventoryReport() {
        Map<String, Object> report = new LinkedHashMap<>();

        List<Inventory> allInventory = inventoryRepository.findByProductActiveTrue();
        Double totalValue = inventoryRepository.calculateTotalInventoryValue();

        report.put("totalProducts", allInventory.size());
        report.put("totalValue", totalValue != null ? totalValue : 0.0);
        report.put("lowStockCount", inventoryRepository.countLowStockItems());
        report.put("outOfStockCount", inventoryRepository.countOutOfStockItems());

        List<Map<String, Object>> stockDetails = allInventory.stream().map(inv -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("productId", inv.getProduct().getId());
            map.put("productName", inv.getProduct().getName());
            map.put("sku", inv.getProduct().getSku());
            map.put("quantity", inv.getQuantity());
            map.put("reorderLevel", inv.getProduct().getReorderLevel());
            map.put("price", inv.getProduct().getPrice());
            map.put("status", inv.getQuantity() == 0 ? "OUT_OF_STOCK"
                    : inv.getQuantity() <= inv.getProduct().getReorderLevel() ? "LOW_STOCK" : "IN_STOCK");
            return map;
        }).collect(Collectors.toList());

        report.put("stockDetails", stockDetails);
        return report;
    }

    public List<Map<String, Object>> getExpiryReport(int daysAhead) {
        LocalDate targetDate = LocalDate.now().plusDays(daysAhead);
        List<Product> expiringProducts = productRepository.findExpiringProducts(targetDate);

        return expiringProducts.stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("sku", p.getSku());
            map.put("expiryDate", p.getExpiryDate().toString());
            map.put("daysUntilExpiry", java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), p.getExpiryDate()));
            return map;
        }).collect(Collectors.toList());
    }
}
