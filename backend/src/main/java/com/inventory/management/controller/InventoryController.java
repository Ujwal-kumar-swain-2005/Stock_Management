package com.inventory.management.controller;

import com.inventory.management.entity.Inventory;
import com.inventory.management.entity.StockTransaction;
import com.inventory.management.entity.User;
import com.inventory.management.service.AuthService;
import com.inventory.management.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final AuthService authService;

    public InventoryController(InventoryService inventoryService, AuthService authService) {
        this.inventoryService = inventoryService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Inventory> getInventoryByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/value")
    public ResponseEntity<Map<String, Object>> getTotalInventoryValue() {
        Map<String, Object> response = Map.of("totalValue", inventoryService.getTotalInventoryValue());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stock-in")
    public ResponseEntity<Inventory> stockIn(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        int quantity = Integer.parseInt(request.get("quantity").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";
        User currentUser = authService.getCurrentUser();

        return ResponseEntity.ok(inventoryService.stockIn(productId, quantity, notes, currentUser));
    }

    @PostMapping("/stock-out")
    public ResponseEntity<Inventory> stockOut(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        int quantity = Integer.parseInt(request.get("quantity").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";
        User currentUser = authService.getCurrentUser();

        return ResponseEntity.ok(inventoryService.stockOut(productId, quantity, notes, currentUser));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<StockTransaction>> getAllTransactions() {
        return ResponseEntity.ok(inventoryService.getAllTransactions());
    }

    @GetMapping("/transactions/product/{productId}")
    public ResponseEntity<List<StockTransaction>> getTransactionsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getTransactionsByProduct(productId));
    }
}
