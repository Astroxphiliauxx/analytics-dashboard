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

    /**
     * Users registered in the last 24 hours.
     */
    private Long newUsersToday;

    private Long totalTxns;

    /**
     * Matches "Pending Actions".
     */
    private Long pendingTrxns;

    /**
     * Sum of all SUCCESS transaction amounts.
     */
    private BigDecimal totalGtv;

    /**
     * Average Ticket Size = Total GTV / SUCCESS Count.
     */
    private BigDecimal averageTicketSize;

    /**
     * Sum of all FAILED transaction amounts.
     */
    private BigDecimal totalFailedVolume;

    /**
     * Percentage of SUCCESS transactions vs total transactions.
     */
    private Double successRate;
}
