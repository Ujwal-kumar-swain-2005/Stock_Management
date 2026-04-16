package com.inventory.management.controller;

import com.inventory.management.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSalesReport(startDate, endDate));
    }

    @GetMapping("/purchases")
    public ResponseEntity<Map<String, Object>> getPurchaseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getPurchaseReport(startDate, endDate));
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    @GetMapping("/expiry")
    public ResponseEntity<List<Map<String, Object>>> getExpiryReport(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(reportService.getExpiryReport(days));
    }
}
