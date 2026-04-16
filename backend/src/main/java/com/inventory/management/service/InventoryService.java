package com.inventory.management.service;

import com.inventory.management.entity.Inventory;
import com.inventory.management.entity.Product;
import com.inventory.management.entity.StockTransaction;
import com.inventory.management.entity.User;
import com.inventory.management.enums.TransactionType;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.repository.InventoryRepository;
import com.inventory.management.repository.ProductRepository;
import com.inventory.management.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;

    public InventoryService(InventoryRepository inventoryRepository, ProductRepository productRepository,
                            StockTransactionRepository transactionRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "productId", productId));
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public Double getTotalInventoryValue() {
        Double value = inventoryRepository.calculateTotalInventoryValue();
        return value != null ? value : 0.0;
    }

    @Transactional
    public Inventory stockIn(Long productId, int quantity, String notes, User performedBy) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> {
                    Inventory newInventory = new Inventory();
                    newInventory.setProduct(product);
                    newInventory.setQuantity(0);
                    return newInventory;
                });

        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventory.setLastUpdated(LocalDateTime.now());
        Inventory savedInventory = inventoryRepository.save(inventory);

        // Record transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(TransactionType.IN);
        transaction.setQuantity(quantity);
        transaction.setNotes(notes);
        transaction.setPerformedBy(performedBy);
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);

        return savedInventory;
    }

    @Transactional
    public Inventory stockOut(Long productId, int quantity, String notes, User performedBy) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "productId", productId));

        if (inventory.getQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock. Available: " + inventory.getQuantity());
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory.setLastUpdated(LocalDateTime.now());
        Inventory savedInventory = inventoryRepository.save(inventory);

        // Record transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(TransactionType.OUT);
        transaction.setQuantity(quantity);
        transaction.setNotes(notes);
        transaction.setPerformedBy(performedBy);
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);

        return savedInventory;
    }

    public List<StockTransaction> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductId(productId);
    }

    public List<StockTransaction> getAllTransactions() {
        return transactionRepository.findRecentTransactions();
    }

    public List<StockTransaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByTransactionDateBetween(start, end);
    }
}
