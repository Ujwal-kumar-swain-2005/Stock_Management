package com.inventory.management.config;

import com.inventory.management.dto.OrderRequest;
import com.inventory.management.entity.Product;
import com.inventory.management.entity.User;
import com.inventory.management.enums.Role;
import com.inventory.management.repository.OrderRepository;
import com.inventory.management.repository.ProductRepository;
import com.inventory.management.repository.UserRepository;
import com.inventory.management.service.OrderService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                      ProductRepository productRepository, OrderService orderService,
                                      OrderRepository orderRepository) {
        return args -> {
         
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@inventory.com");
                admin.setFullName("System Administrator");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Default admin user created: admin / admin123");
            }

           
            if (!userRepository.existsByUsername("manager")) {
                User manager = new User();
                manager.setUsername("manager");
                manager.setPassword(passwordEncoder.encode("manager123"));
                manager.setEmail("manager@inventory.com");
                manager.setFullName("Store Manager");
                manager.setRole(Role.MANAGER);
                userRepository.save(manager);
                System.out.println("Default manager user created: manager / manager123");
            }
            if (!userRepository.existsByUsername("staff")) {
                User staff = new User();
                staff.setUsername("staff");
                staff.setPassword(passwordEncoder.encode("staff123"));
                staff.setEmail("staff@inventory.com");
                staff.setFullName("Staff Member");
                staff.setRole(Role.STAFF);
                userRepository.save(staff);
                System.out.println("Default staff user created: staff / staff123");
            }

            if (orderRepository.count() == 0) {
                User adminUser = userRepository.findByUsername("admin").orElse(null);
                if (adminUser != null) {
                    Product dummyProduct = null;
                    if (productRepository.count() == 0) {
                        Product p = new Product();
                        p.setName("Test Product");
                        p.setSku("TEST-001");
                        p.setPrice(new BigDecimal("100.00"));
                        p.setCostPrice(new BigDecimal("50.00"));
                        p.setReorderLevel(10);
                        dummyProduct = productRepository.save(p);
                        System.out.println("Dummy product created.");
                    } else {
                        dummyProduct = productRepository.findAll().get(0);
                    }

                    OrderRequest req1 = new OrderRequest();
                    req1.setOrderType("PURCHASE");
                    req1.setNotes("First mock purchase order");
                    OrderRequest.OrderItemRequest item1 = new OrderRequest.OrderItemRequest();
                    item1.setProductId(dummyProduct.getId());
                    item1.setQuantity(50);
                    item1.setUnitPrice(new BigDecimal("15.99"));
                    req1.setItems(List.of(item1));
                    orderService.createOrder(req1, adminUser);

                    OrderRequest req2 = new OrderRequest();
                    req2.setOrderType("SALES");
                    req2.setNotes("First mock sales order");
                    OrderRequest.OrderItemRequest item2 = new OrderRequest.OrderItemRequest();
                    item2.setProductId(dummyProduct.getId());
                    item2.setQuantity(2);
                    item2.setUnitPrice(new BigDecimal("99.99"));
                    req2.setItems(List.of(item2));
                    orderService.createOrder(req2, adminUser);

                    System.out.println("Mock orders created successfully.");
                }
            }
        };
    }
}
