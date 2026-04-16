package com.inventory.management.config;

import com.inventory.management.entity.User;
import com.inventory.management.enums.Role;
import com.inventory.management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Create default Admin user
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

            // Create default Manager user
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

            // Create default Staff user
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
        };
    }
}
