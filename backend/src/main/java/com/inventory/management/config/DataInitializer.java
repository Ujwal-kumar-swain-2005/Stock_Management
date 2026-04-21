package com.inventory.management.config;

import com.inventory.management.dto.OrderRequest;
import com.inventory.management.entity.Category;
import com.inventory.management.entity.Order;
import com.inventory.management.entity.Product;
import com.inventory.management.entity.Supplier;
import com.inventory.management.entity.User;
import com.inventory.management.enums.Role;
import com.inventory.management.repository.*;
import com.inventory.management.service.OrderService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                      ProductRepository productRepository, OrderService orderService,
                                      OrderRepository orderRepository, CategoryRepository categoryRepository,
                                      SupplierRepository supplierRepository, InventoryRepository inventoryRepository,
                                      StockTransactionRepository stockTransactionRepository) {
        return args -> {
            boolean performReset = true;

            if (performReset) {
                System.out.println("Beginning Large-Scale Data Factory Wipe & Seed...");
                // Note: Delete sequence matters to respect generic foreign key cascades
                stockTransactionRepository.deleteAll();
                orderRepository.deleteAll();
                inventoryRepository.deleteAll();
                productRepository.deleteAll();
                categoryRepository.deleteAll();
                supplierRepository.deleteAll();
            }

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@inventory.com");
                admin.setFullName("System Administrator");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }

            if (!userRepository.existsByUsername("manager")) {
                User manager = new User();
                manager.setUsername("manager");
                manager.setPassword(passwordEncoder.encode("manager123"));
                manager.setEmail("manager@inventory.com");
                manager.setFullName("Store Manager");
                manager.setRole(Role.MANAGER);
                userRepository.save(manager);
            }

            if (!userRepository.existsByUsername("staff")) {
                User staff = new User();
                staff.setUsername("staff");
                staff.setPassword(passwordEncoder.encode("staff123"));
                staff.setEmail("staff@inventory.com");
                staff.setFullName("Staff Member");
                staff.setRole(Role.STAFF);
                userRepository.save(staff);
            }

            if (productRepository.count() == 0) {
                User adminUser = userRepository.findByUsername("admin").get();

                // 1. Generate 11 Categories
                String[] catNames = {"Electronics", "Office Supplies", "Furniture", "Networking", "Software", 
                                     "Peripherals", "Cables", "Storage", "Components", "Accessories", "Safety Gear"};
                List<Category> categories = new ArrayList<>();
                for (String catName : catNames) {
                    Category c = new Category();
                    c.setName(catName);
                    c.setDescription("Supplies for " + catName);
                    categories.add(categoryRepository.save(c));
                }

                // 2. Generate 7 Suppliers
                String[] supNames = {"Global Tech Distro", "Local Woodworks", "Office Max Supplier", 
                                     "CableCo Connect", "Storage Systems Inc", "SafeTech Partners", "Electro World"};
                List<Supplier> suppliers = new ArrayList<>();
                for (String supName : supNames) {
                    Supplier s = new Supplier();
                    s.setName(supName);
                    s.setContactPerson("Rep " + supName);
                    s.setEmail("contact@" + supName.replace(" ", "").toLowerCase() + ".com");
                    s.setPhone("555-" + (int)(Math.random()*9000 + 1000));
                    s.setAddress((int)(Math.random()*9000) + " Business Blvd");
                    suppliers.add(supplierRepository.save(s));
                }

                // 3. Generate 25 Products
                String[] prodNames = {
                    "ThinkPad T14", "LaserJet Toner", "Standing Desk", "Wireless Mouse", "Ethernet Cable 10m",
                    "Office Chair", "Monitor 24inch", "External HDD 1TB", "Mechanical Keyboard", "USB-C Hub",
                    "RAM 16GB DDR4", "SSD 512GB NVMe", "Ergonomic Pad", "Webcam 1080p", "Headset with Mic",
                    "Router WiFi 6", "Whiteboard 4x3", "Pack of Pens", "Printer Paper A4", "Safety Goggles",
                    "UPS Battery Backup", "Bluetooth Speaker", "Server Rack", "HDMI Cable 2m", "Projector 4K"
                };

                List<Product> products = new ArrayList<>();
                for (int i = 0; i < prodNames.length; i++) {
                    Product p = new Product();
                    p.setName(prodNames[i]);
                    p.setSku(String.format("PRD-%04d", i + 1));
                    p.setDescription("High quality " + prodNames[i] + " for business needs.");
                    p.setCategory(categories.get(i % categories.size()));
                    p.setSupplier(suppliers.get(i % suppliers.size()));
                    double basePrice = 15.0 + (Math.random() * 400.0);
                    p.setCostPrice(BigDecimal.valueOf(basePrice).setScale(2, java.math.RoundingMode.HALF_UP));
                    p.setPrice(BigDecimal.valueOf(basePrice * 1.5).setScale(2, java.math.RoundingMode.HALF_UP)); // 50% markup
                    p.setReorderLevel((int)(Math.random() * 20 + 5));
                    
                    // Assign Expiry Date to a subset of fast-moving goods
                    if (catNames[i % categories.size()].equals("Office Supplies")) {
                        p.setExpiryDate(LocalDate.now().plusDays((long)(Math.random() * 120 + 10)));
                    }
                    products.add(productRepository.save(p));
                }

                System.out.println("Entities Saved. Orchestrating complex orders for 6 months of historical data...");

                // 4. Generate historical data spanning past 180 days
                // We progress day by day, creating orders and ensuring dates are set correctly.
                for (int days = 180; days >= 0; days -= 3) {
                    LocalDateTime orderDateTime = LocalDateTime.now().minusDays(days);
                    
                    // Create a PURCHASE Order (Restock) everyday every 3 days
                    OrderRequest poReq = new OrderRequest();
                    poReq.setOrderType("PURCHASE");
                    poReq.setNotes("Automated Bulk Restock - " + days + " days ago");
                    
                    List<OrderRequest.OrderItemRequest> poItems = new ArrayList<>();
                    for(int j = 0; j < 4; j++) {
                        Product randomProd = products.get((int)(Math.random() * products.size()));
                        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
                        item.setProductId(randomProd.getId());
                        item.setQuantity((int)(Math.random() * 40 + 20)); // Buy 20-60 items
                        item.setUnitPrice(randomProd.getCostPrice());
                        poItems.add(item);
                    }
                    poReq.setItems(poItems);
                    Order po = orderService.createOrder(poReq, adminUser);
                    orderService.confirmOrder(po.getId(), adminUser);
                    
                    Order pastPoEntity = orderRepository.findById(po.getId()).get();
                    pastPoEntity.setOrderDate(orderDateTime);
                    orderRepository.save(pastPoEntity);

                    // Create 1-2 SALES Orders to randomly decrease stock
                    int numSales = (int)(Math.random() * 2) + 1;
                    for (int s = 0; s < numSales; s++) {
                        try {
                            OrderRequest soReq = new OrderRequest();
                            soReq.setOrderType("SALES");
                            soReq.setNotes("Automated Customer Sale - " + days + " days ago");
                            
                            List<OrderRequest.OrderItemRequest> soItems = new ArrayList<>();
                            int itemsCount = (int)(Math.random() * 3) + 1;
                            for(int j = 0; j < itemsCount; j++) {
                                Product randomProd = products.get((int)(Math.random() * products.size()));
                                OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
                                item.setProductId(randomProd.getId());
                                item.setQuantity((int)(Math.random() * 5 + 1)); // Sell 1-5 items
                                item.setUnitPrice(randomProd.getPrice());
                                soItems.add(item);
                            }
                            soReq.setItems(soItems);
                            Order so = orderService.createOrder(soReq, adminUser);
                            orderService.confirmOrder(so.getId(), adminUser);
                            
                            Order pastSoEntity = orderRepository.findById(so.getId()).get();
                            pastSoEntity.setOrderDate(orderDateTime);
                            orderRepository.save(pastSoEntity);
                        } catch (Exception e) {
                            // If insufficient stock or identical product constraint occurs, just ignore and continue
                        }
                    }
                }

                // 5. Backdate all StockTransactions to match their parent orders
                List<com.inventory.management.entity.StockTransaction> txs = stockTransactionRepository.findAll();
                List<Order> allOrders = orderRepository.findAll();
                Map<String, LocalDateTime> orderDates = new HashMap<>();
                for (Order o : allOrders) {
                    orderDates.put(o.getOrderNumber(), o.getOrderDate());
                }
                
                for (com.inventory.management.entity.StockTransaction tx : txs) {
                    if (tx.getNotes() != null) {
                        for (String orderNumber : orderDates.keySet()) {
                            if (tx.getNotes().contains(orderNumber)) {
                                tx.setTransactionDate(orderDates.get(orderNumber));
                                stockTransactionRepository.save(tx);
                                break;
                            }
                        }
                    }
                }

                System.out.println("Massive Factory Data Seed Completed Successfully!");
            }
        };
    }
}
