package com.toucanus.analytics_dashboard.service.graph;

import com.toucanus.analytics_dashboard.dto.graph.DailyStatusDTO;
import com.toucanus.analytics_dashboard.dto.graph.HourlyStatDTO;
import com.toucanus.analytics_dashboard.dto.graph.PaymentStatDTO;
import com.toucanus.analytics_dashboard.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service responsible for graph/chart analytics data.
 */
@Service
@RequiredArgsConstructor
public class GraphAnalyticsService {

    private final TransactionRepository transactionRepository;

    /**
     * Payment method distribution chart.
     *
     * @param startDate the start date (inclusive); defaults to 30 days ago if null
     * @param endDate   the end date (inclusive); defaults to today if null
     */
    @Cacheable(value = "paymentStats", key = "#startDate?.toString() + '-' + #endDate?.toString()")
    public List<PaymentStatDTO> getPaymentStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(30);
        }
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        return transactionRepository.selectPaymentMethodStatsInRange(startDateTime, endDateTime);
    }

    /**
     * Stacked bar chart: daily counts for SUCCESS, FAILED, PENDING.
     *
     * @param startDate the start date (inclusive); defaults to 7 days before
     *                  endDate if null
     * @param endDate   the end date (inclusive); defaults to today if null
     */
    @Cacheable(value = "dailyAnalytics", key = "#startDate?.toString() + '-' + #endDate?.toString()")
    public List<DailyStatusDTO> getDailyStatusStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(6);
        }

        // Calculate the number of days in the range
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Single optimized query that returns all data at once
        List<Object[]> rows = transactionRepository.selectOptimizedDailyStats(startDateTime, endDateTime);

        // Build a map day -> DailyStatusDTO
        Map<LocalDate, DailyStatusDTO> map = new LinkedHashMap<>();

        // Pre-fill all days in the range with zero counts
        for (long i = daysBetween; i >= 0; i--) {
            LocalDate d = endDate.minusDays(i);
            map.put(d, new DailyStatusDTO(d, 0L, 0L, 0L, BigDecimal.ZERO, 0L));
        }

        // Parse optimized query results: [date, txnCount, totalAmount, successCount,
        // failedCount, pendingCount]
        for (Object[] row : rows) {
            LocalDate day = parseLocalDate(row[0]);
            DailyStatusDTO dto = map.get(day);
            if (dto == null)
                continue;

            dto.setTxnCount(((Number) row[1]).longValue());
            dto.setTotalAmount(row[2] instanceof BigDecimal bd ? bd : new BigDecimal(row[2].toString()));
            dto.setSuccessCount(((Number) row[3]).longValue());
            dto.setFailedCount(((Number) row[4]).longValue());
            dto.setPendingCount(((Number) row[5]).longValue());
        }

        return new ArrayList<>(map.values());
    }

    /**
     * Hourly heatmap: counts per hour of day (0-23) for a date range.
     *
     * @param startDate the start date (inclusive); defaults to today if null
     * @param endDate   the end date (inclusive); defaults to today if null
     */
    @Cacheable(value = "hourlyTraffic", key = "#startDate?.toString() + '-' + #endDate?.toString()")
    public List<HourlyStatDTO> getHourlyTrafficStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate;
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Single optimized query: [hour, successCount, failedCount, pendingCount]
        List<Object[]> rows = transactionRepository.selectOptimizedHourlyStats(startDateTime, endDateTime);

        // Pre-fill 0-23 with zero counts per status
        Map<Integer, HourlyStatDTO> hourMap = new LinkedHashMap<>();
        for (int h = 0; h < 24; h++) {
            hourMap.put(h, new HourlyStatDTO(h, 0L, 0L, 0L));
        }

        for (Object[] row : rows) {
            int hour = ((Number) row[0]).intValue();
            HourlyStatDTO dto = hourMap.get(hour);
            if (dto != null) {
                dto.setSuccessCount(((Number) row[1]).longValue());
                dto.setFailedCount(((Number) row[2]).longValue());
                dto.setPendingCount(((Number) row[3]).longValue());
            }
        }

        return new ArrayList<>(hourMap.values());
    }

    private LocalDate parseLocalDate(Object obj) {
        if (obj instanceof LocalDate ld) {
            return ld;
        } else if (obj instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        return LocalDate.parse(String.valueOf(obj));
    }
}
