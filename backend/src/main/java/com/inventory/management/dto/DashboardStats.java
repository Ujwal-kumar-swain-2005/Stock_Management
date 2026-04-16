package com.inventory.management.dto;

import java.util.List;
import java.util.Map;

public class DashboardStats {

    private long totalProducts;
    private long totalCategories;
    private long totalSuppliers;
    private long totalOrders;
    private long lowStockItems;
    private long outOfStockItems;
    private double totalInventoryValue;
    private double totalSales;
    private double totalPurchases;
    private List<Map<String, Object>> recentTransactions;
    private List<Map<String, Object>> lowStockProducts;
    private List<Map<String, Object>> monthlySales;

    public DashboardStats() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getTotalSuppliers() {
        return totalSuppliers;
    }

    public void setTotalSuppliers(long totalSuppliers) {
        this.totalSuppliers = totalSuppliers;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getLowStockItems() {
        return lowStockItems;
    }

    public void setLowStockItems(long lowStockItems) {
        this.lowStockItems = lowStockItems;
    }

    public long getOutOfStockItems() {
        return outOfStockItems;
    }

    public void setOutOfStockItems(long outOfStockItems) {
        this.outOfStockItems = outOfStockItems;
    }

    public double getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(double totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }

    public double getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(double totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public List<Map<String, Object>> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<Map<String, Object>> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }

    public List<Map<String, Object>> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<Map<String, Object>> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public List<Map<String, Object>> getMonthlySales() {
        return monthlySales;
    }

    public void setMonthlySales(List<Map<String, Object>> monthlySales) {
        this.monthlySales = monthlySales;
    }
}
