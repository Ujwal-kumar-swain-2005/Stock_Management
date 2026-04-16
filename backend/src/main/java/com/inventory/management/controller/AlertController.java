package com.inventory.management.controller;

import com.inventory.management.entity.Inventory;
import com.inventory.management.entity.Product;
import com.inventory.management.service.InventoryService;
import com.inventory.management.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final InventoryService inventoryService;
    private final ProductService productService;

    public AlertController(InventoryService inventoryService, ProductService productService) {
        this.inventoryService = inventoryService;
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAlerts() {
        Map<String, Object> alerts = new LinkedHashMap<>();

        // Low stock alerts
        List<Inventory> lowStock = inventoryService.getLowStockItems();
        List<Map<String, Object>> lowStockAlerts = lowStock.stream().map(inv -> {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("type", "LOW_STOCK");
            alert.put("severity", inv.getQuantity() == 0 ? "CRITICAL" : "WARNING");
            alert.put("productId", inv.getProduct().getId());
            alert.put("productName", inv.getProduct().getName());
            alert.put("currentStock", inv.getQuantity());
            alert.put("reorderLevel", inv.getProduct().getReorderLevel());
            alert.put("message", inv.getQuantity() == 0
                    ? "OUT OF STOCK: " + inv.getProduct().getName()
                    : "Low stock: " + inv.getProduct().getName() + " (" + inv.getQuantity() + " remaining)");
            return alert;
        }).collect(Collectors.toList());

        // Expiry alerts (30 days)
        List<Product> expiringProducts = productService.getExpiringProducts(30);
        List<Map<String, Object>> expiryAlerts = expiringProducts.stream().map(p -> {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("type", "EXPIRY");
            alert.put("severity", p.getExpiryDate().isBefore(java.time.LocalDate.now()) ? "CRITICAL" : "WARNING");
            alert.put("productId", p.getId());
            alert.put("productName", p.getName());
            alert.put("expiryDate", p.getExpiryDate().toString());
            alert.put("message", p.getExpiryDate().isBefore(java.time.LocalDate.now())
                    ? "EXPIRED: " + p.getName()
                    : "Expiring soon: " + p.getName() + " (expires " + p.getExpiryDate() + ")");
            return alert;
        }).collect(Collectors.toList());

        alerts.put("lowStockAlerts", lowStockAlerts);
        alerts.put("expiryAlerts", expiryAlerts);
        alerts.put("totalAlerts", lowStockAlerts.size() + expiryAlerts.size());

        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/expiry")
    public ResponseEntity<List<Product>> getExpiryAlerts(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(productService.getExpiringProducts(days));
    }
}
