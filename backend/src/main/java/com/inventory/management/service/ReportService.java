package com.inventory.management.service;

import com.inventory.management.entity.Inventory;
import com.inventory.management.entity.Order;
import com.inventory.management.entity.Product;
import com.inventory.management.entity.StockTransaction;
import com.inventory.management.enums.OrderType;
import com.inventory.management.enums.TransactionType;
import com.inventory.management.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

        report.put("totalAmount", totalSales != null ? totalSales : 0.0);
        report.put("totalOrders", totalOrders);
        report.put("averageOrderValue", totalOrders > 0 ? (totalSales != null ? totalSales : 0.0) / totalOrders : 0.0);
        report.put("startDate", startDate.toString());
        report.put("endDate", endDate.toString());

        // Generate ordersByDate for the BarChart
        List<Order> salesOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderType() == OrderType.SALES && 
                             !o.getOrderDate().isBefore(start) && 
                             !o.getOrderDate().isAfter(end))
                .collect(Collectors.toList());

        Map<String, Double> dailySales = new TreeMap<>();
        for (Order o : salesOrders) {
            String dateStr = o.getOrderDate().toLocalDate().toString();
            dailySales.put(dateStr, dailySales.getOrDefault(dateStr, 0.0) + o.getTotalAmount().doubleValue());
        }

        List<Map<String, Object>> ordersByDate = dailySales.entrySet().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", e.getKey());
            map.put("amount", e.getValue());
            return map;
        }).collect(Collectors.toList());

        report.put("ordersByDate", ordersByDate);

        return report;
    }

    public Map<String, Object> getPurchaseReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Map<String, Object> report = new LinkedHashMap<>();
        Double totalPurchases = orderRepository.sumTotalByTypeAndDateRange(OrderType.PURCHASE, start, end);
        long totalOrders = orderRepository.countByTypeAndDateRange(OrderType.PURCHASE, start, end);

        report.put("totalAmount", totalPurchases != null ? totalPurchases : 0.0);
        report.put("totalOrders", totalOrders);
        report.put("averageOrderValue", totalOrders > 0 ? (totalPurchases != null ? totalPurchases : 0.0) / totalOrders : 0.0);
        report.put("startDate", startDate.toString());
        report.put("endDate", endDate.toString());

        // Generate ordersByDate for the BarChart
        List<Order> purchaseOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderType() == OrderType.PURCHASE && 
                             !o.getOrderDate().isBefore(start) && 
                             !o.getOrderDate().isAfter(end))
                .collect(Collectors.toList());

        Map<String, Double> dailyPurchases = new TreeMap<>();
        for (Order o : purchaseOrders) {
            String dateStr = o.getOrderDate().toLocalDate().toString();
            dailyPurchases.put(dateStr, dailyPurchases.getOrDefault(dateStr, 0.0) + o.getTotalAmount().doubleValue());
        }

        List<Map<String, Object>> purchasesByDate = dailyPurchases.entrySet().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", e.getKey());
            map.put("amount", e.getValue());
            return map;
        }).collect(Collectors.toList());

        report.put("ordersByDate", purchasesByDate);

        return report;
    }

    public Map<String, Object> getInventoryReport() {
        Map<String, Object> report = new LinkedHashMap<>();

        List<Inventory> allInventory = inventoryRepository.findByProductActiveTrue();
        Double totalValue = inventoryRepository.calculateTotalInventoryValue();

        report.put("totalItems", allInventory.size());
        report.put("totalValue", totalValue != null ? totalValue : 0.0);
        report.put("lowStockCount", inventoryRepository.countLowStockItems());
        report.put("outOfStockCount", inventoryRepository.countOutOfStockItems());

        // Generate categoryBreakdown for the PieChart
        Map<String, Double> catBreakdown = new HashMap<>();
        for (Inventory inv : allInventory) {
            String catName = inv.getProduct().getCategory().getName();
            double value = inv.getQuantity() * inv.getProduct().getCostPrice().doubleValue();
            catBreakdown.put(catName, catBreakdown.getOrDefault(catName, 0.0) + value);
        }
        
        List<Map<String, Object>> categoryBreakdownList = catBreakdown.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", e.getKey());
            map.put("value", e.getValue());
            return map;
        }).collect(Collectors.toList());
        report.put("categoryBreakdown", categoryBreakdownList);

        List<Map<String, Object>> stockDetails = allInventory.stream().map(inv -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("productId", inv.getProduct().getId());
            map.put("productName", inv.getProduct().getName());
            map.put("sku", inv.getProduct().getSku());
            map.put("quantity", inv.getQuantity());
            map.put("reorderLevel", inv.getProduct().getReorderLevel());
            map.put("value", inv.getQuantity() * inv.getProduct().getCostPrice().doubleValue());
            map.put("price", inv.getProduct().getPrice());
            map.put("status", inv.getQuantity() == 0 ? "OUT_OF_STOCK"
                    : inv.getQuantity() <= inv.getProduct().getReorderLevel() ? "LOW_STOCK" : "IN_STOCK");
            return map;
        }).collect(Collectors.toList());

        report.put("items", stockDetails);
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
