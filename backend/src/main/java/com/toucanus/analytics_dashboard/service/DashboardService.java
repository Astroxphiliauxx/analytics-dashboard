package com.toucanus.analytics_dashboard.service;

import com.toucanus.analytics_dashboard.dto.DashboardStatsDTO;
import com.toucanus.analytics_dashboard.repository.TransactionRepository;
import com.toucanus.analytics_dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Cacheable(value = "dashboardStats")
    public DashboardStatsDTO getDashboardStats() {
        // Single optimized query for all transaction stats
        List<Object[]> result = transactionRepository.getAggregatedStats();
        Object[] stats = result.isEmpty() ? new Object[] { 0L, 0L, 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO }
                : result.get(0);

        long totalTxns = ((Number) stats[0]).longValue();
        long successTxns = ((Number) stats[1]).longValue();
        long pendingTxns = ((Number) stats[2]).longValue();
        BigDecimal totalGtv = stats[4] instanceof BigDecimal bd ? bd : new BigDecimal(stats[4].toString());
        BigDecimal totalFailedVolume = stats[5] instanceof BigDecimal bd ? bd : new BigDecimal(stats[5].toString());

        // User stats (these are fast)
        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(1));

        BigDecimal averageTicketSize = BigDecimal.ZERO;
        if (successTxns > 0) {
            averageTicketSize = totalGtv.divide(BigDecimal.valueOf(successTxns),
                    new MathContext(16, RoundingMode.HALF_UP));
        }

        double successRate = (totalTxns == 0)
                ? 0.0
                : (successTxns * 100.0) / totalTxns;

        return new DashboardStatsDTO(
                totalUsers,
                newUsersToday,
                totalTxns,
                pendingTxns,
                totalGtv,
                averageTicketSize,
                totalFailedVolume,
                successRate);
    }

    /**
     * Get dashboard stats filtered by date range.
     *
     * @param startDate the start date (inclusive)
     * @param endDate   the end date (inclusive)
     */
    @Cacheable(value = "filteredDashboardStats", key = "#startDate.toString() + '-' + #endDate.toString()")
    public DashboardStatsDTO getDashboardStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(30);
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Single optimized query for all transaction stats
        List<Object[]> result = transactionRepository.getAggregatedStatsInRange(startDateTime, endDateTime);
        Object[] stats = result.isEmpty() ? new Object[] { 0L, 0L, 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO }
                : result.get(0);

        long totalTxns = ((Number) stats[0]).longValue();
        long successTxns = ((Number) stats[1]).longValue();
        long pendingTxns = ((Number) stats[2]).longValue();
        BigDecimal totalGtv = stats[4] instanceof BigDecimal bd ? bd : new BigDecimal(stats[4].toString());
        BigDecimal totalFailedVolume = stats[5] instanceof BigDecimal bd ? bd : new BigDecimal(stats[5].toString());

        // User stats
        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(1));

        BigDecimal averageTicketSize = BigDecimal.ZERO;
        if (successTxns > 0) {
            averageTicketSize = totalGtv.divide(BigDecimal.valueOf(successTxns),
                    new MathContext(16, RoundingMode.HALF_UP));
        }

        double successRate = (totalTxns == 0)
                ? 0.0
                : (successTxns * 100.0) / totalTxns;

        return new DashboardStatsDTO(
                totalUsers,
                newUsersToday,
                totalTxns,
                pendingTxns,
                totalGtv,
                averageTicketSize,
                totalFailedVolume,
                successRate);
    }
}
