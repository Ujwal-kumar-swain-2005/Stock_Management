package com.inventory.management.service;

import com.inventory.management.dto.OrderRequest;
import com.inventory.management.entity.*;
import com.inventory.management.enums.OrderStatus;
import com.inventory.management.enums.OrderType;
import com.inventory.management.enums.TransactionType;
import com.inventory.management.exception.BadRequestException;
import com.inventory.management.exception.ResourceNotFoundException;
import com.inventory.management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockTransactionRepository transactionRepository;

    private static final AtomicLong orderCounter = new AtomicLong(System.currentTimeMillis());

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        InventoryRepository inventoryRepository, StockTransactionRepository transactionRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    public List<Order> getOrdersByType(String type) {
        OrderType orderType = OrderType.valueOf(type.toUpperCase());
        return orderRepository.findByOrderType(orderType);
    }

    public List<Order> getOrdersByStatus(String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        return orderRepository.findByStatus(orderStatus);
    }

    @Transactional
    public Order createOrder(OrderRequest request, User createdBy) {
        OrderType orderType = OrderType.valueOf(request.getOrderType().toUpperCase());

        String orderNumber = generateOrderNumber(orderType);

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setOrderType(orderType);
        order.setStatus(OrderStatus.PENDING);
        order.setNotes(request.getNotes());
        order.setCreatedBy(createdBy);
        order.setOrderDate(LocalDateTime.now());

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must have at least one item");
        }

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getPrice());
            order.addOrderItem(orderItem);
        }

        order.calculateTotalAmount();
        Order savedOrder = orderRepository.save(order);

        return savedOrder;
    }

    @Transactional
    public Order confirmOrder(Long orderId, User performedBy) {
        Order order = getOrderById(orderId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only pending orders can be confirmed");
        }

        order.setStatus(OrderStatus.CONFIRMED);

        // Update inventory based on order type
        for (OrderItem item : order.getOrderItems()) {
            Inventory inventory = inventoryRepository.findByProductId(item.getProduct().getId())
                    .orElseGet(() -> {
                        Inventory newInv = new Inventory();
                        newInv.setProduct(item.getProduct());
                        newInv.setQuantity(0);
                        return newInv;
                    });

            if (order.getOrderType() == OrderType.PURCHASE) {
                // Stock IN for purchase
                inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
                recordTransaction(item.getProduct(), TransactionType.IN, item.getQuantity(),
                        "Purchase Order: " + order.getOrderNumber(), performedBy);
            } else if (order.getOrderType() == OrderType.SALES) {
                // Stock OUT for sales
                if (inventory.getQuantity() < item.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for product: " + item.getProduct().getName()
                            + ". Available: " + inventory.getQuantity());
                }
                inventory.setQuantity(inventory.getQuantity() - item.getQuantity());
                recordTransaction(item.getProduct(), TransactionType.OUT, item.getQuantity(),
                        "Sales Order: " + order.getOrderNumber(), performedBy);
            }

            inventory.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(inventory);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a delivered or already cancelled order");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    private void recordTransaction(Product product, TransactionType type, int quantity, String notes, User performedBy) {
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setNotes(notes);
        transaction.setPerformedBy(performedBy);
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    private String generateOrderNumber(OrderType type) {
        String prefix = type == OrderType.PURCHASE ? "PO" : "SO";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return prefix + "-" + timestamp + "-" + orderCounter.incrementAndGet() % 10000;
    }
}
