package com.inventory.management.service;

import com.inventory.management.dto.ProductRequest;
import com.inventory.management.entity.Category;
import com.inventory.management.entity.Inventory;
import com.inventory.management.entity.Product;
import com.inventory.management.entity.Supplier;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.repository.CategoryRepository;
import com.inventory.management.repository.InventoryRepository;
import com.inventory.management.repository.ProductRepository;
import com.inventory.management.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                          SupplierRepository supplierRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> getProductsBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Transactional
    public Product createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCostPrice(request.getCostPrice());
        product.setReorderLevel(request.getReorderLevel());
        product.setExpiryDate(request.getExpiryDate());
        product.setImageUrl(request.getImageUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            product.setSupplier(supplier);
        }

        Product savedProduct = productRepository.save(product);

        // Create inventory record for the product
        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setQuantity(0);
        inventoryRepository.save(inventory);

        return savedProduct;
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCostPrice(request.getCostPrice());
        product.setReorderLevel(request.getReorderLevel());
        product.setExpiryDate(request.getExpiryDate());
        product.setImageUrl(request.getImageUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            product.setSupplier(supplier);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    public List<Product> getExpiringProducts(int daysAhead) {
        LocalDate targetDate = LocalDate.now().plusDays(daysAhead);
        return productRepository.findExpiringProducts(targetDate);
    }
}
