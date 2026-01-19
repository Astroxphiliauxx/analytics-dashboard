package com.toucanus.analytics_dashboard.controller;

import com.toucanus.analytics_dashboard.dto.DashboardStatsDTO;
import com.toucanus.analytics_dashboard.dto.graph.DailyStatusDTO;
import com.toucanus.analytics_dashboard.dto.graph.HourlyStatDTO;
import com.toucanus.analytics_dashboard.dto.graph.PaymentStatDTO;
import com.toucanus.analytics_dashboard.service.DashboardService;
import com.toucanus.analytics_dashboard.service.graph.GraphAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final GraphAnalyticsService graphAnalyticsService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/stats/filtered")
    public ResponseEntity<DashboardStatsDTO> getFilteredDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(startDate, endDate));
    }

    @GetMapping("/analytics/daily")
    public ResponseEntity<List<DailyStatusDTO>> getDailyAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(graphAnalyticsService.getDailyStatusStats(startDate, endDate));
    }

    @GetMapping("/analytics/payment-methods")
    public ResponseEntity<List<PaymentStatDTO>> getPaymentMethodAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(graphAnalyticsService.getPaymentStats(startDate, endDate));
    }

    @GetMapping("/analytics/daily-status")
    public ResponseEntity<List<DailyStatusDTO>> getDailyStatusAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(graphAnalyticsService.getDailyStatusStats(startDate, endDate));
    }

    @GetMapping("/analytics/hourly-traffic")
    public ResponseEntity<List<HourlyStatDTO>> getHourlyTrafficAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(graphAnalyticsService.getHourlyTrafficStats(startDate, endDate));
    }
}
