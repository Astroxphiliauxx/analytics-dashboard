package com.toucanus.analytics_dashboard.controller;

import com.toucanus.analytics_dashboard.dto.DashboardStatsDTO;
import com.toucanus.analytics_dashboard.dto.DailyStatDTO;
import com.toucanus.analytics_dashboard.dto.PaymentStatDTO;
import com.toucanus.analytics_dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/analytics/daily")
    public ResponseEntity<List<DailyStatDTO>> getDailyAnalytics() {
        return ResponseEntity.ok(dashboardService.getDailyStats());
    }

    @GetMapping("/analytics/payment-methods")
    public ResponseEntity<List<PaymentStatDTO>> getPaymentMethodAnalytics() {
        return ResponseEntity.ok(dashboardService.getPaymentStats());
    }
}
