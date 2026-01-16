package com.toucanus.analytics_dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private Long totalUsers;

    private Long totalTxns;

    /**
     * Sum of all SUCCESS transaction amounts.
     */
    private BigDecimal totalGtv;

    /**
     * Percentage of SUCCESS transactions vs total transactions.
     */
    private Double successRate;
}
