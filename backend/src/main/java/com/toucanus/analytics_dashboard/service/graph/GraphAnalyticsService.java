package com.toucanus.analytics_dashboard.service.graph;

import com.toucanus.analytics_dashboard.dto.graph.DailyStatusDTO;
import com.toucanus.analytics_dashboard.dto.graph.HourlyStatDTO;
import com.toucanus.analytics_dashboard.dto.graph.PaymentStatDTO;
import com.toucanus.analytics_dashboard.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
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
    public List<PaymentStatDTO> getPaymentStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(30);
        }
        return transactionRepository.selectPaymentMethodStatsInRange(startDate, endDate);
    }

    /**
     * Stacked bar chart: daily counts for SUCCESS, FAILED, PENDING.
     *
     * @param startDate the start date (inclusive); defaults to 7 days before endDate if null
     * @param endDate   the end date (inclusive); defaults to today if null
     */
    public List<DailyStatusDTO> getDailyStatusStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(6);
        }
        
        // Calculate the number of days in the range
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);

        List<Object[]> rows = transactionRepository.selectDailyStatusStats(startDate, endDate);
        List<Object[]> totals = transactionRepository.selectDailyStatsInRange(startDate, endDate);

        // Build a map day -> DailyStatusDTO to aggregate per-status counts
        Map<LocalDate, DailyStatusDTO> map = new LinkedHashMap<>();

        // Pre-fill all days in the range with zero counts
        for (long i = daysBetween; i >= 0; i--) {
            LocalDate d = endDate.minusDays(i);
            map.put(d, new DailyStatusDTO(d, 0L, 0L, 0L, BigDecimal.ZERO, 0L));
        }

        for (Object[] row : rows) {
            LocalDate day = parseLocalDate(row[0]);
            String statusStr = String.valueOf(row[1]);
            long cnt = ((Number) row[2]).longValue();

            DailyStatusDTO dto = map.get(day);
            if (dto == null) {
                // day outside range, skip
                continue;
            }
            switch (statusStr) {
                case "SUCCESS" -> dto.setSuccessCount(dto.getSuccessCount() + cnt);
                case "FAILED" -> dto.setFailedCount(dto.getFailedCount() + cnt);
                case "PENDING" -> dto.setPendingCount(dto.getPendingCount() + cnt);
                default -> { /* ignore unknown */ }
            }
        }

        // Attach totals and txn counts
        for (Object[] row : totals) {
            LocalDate day = parseLocalDate(row[0]);
            BigDecimal totalAmount = (row[1] instanceof BigDecimal bd)
                    ? bd
                    : new BigDecimal(String.valueOf(row[1]));
            long txnCount = ((Number) row[2]).longValue();

            DailyStatusDTO dto = map.get(day);
            if (dto != null) {
                dto.setTotalAmount(totalAmount);
                dto.setTxnCount(txnCount);
            }
        }

        return new ArrayList<>(map.values());
    }

    /**
     * Hourly heatmap: counts per hour of day (0-23) for a date range.
     *
     * @param startDate the start date (inclusive); defaults to today if null
     * @param endDate   the end date (inclusive); defaults to today if null
     */
    public List<HourlyStatDTO> getHourlyTrafficStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate;
        }

        List<Object[]> rows = transactionRepository.selectHourlyTrafficStatsInRange(startDate, endDate);

        // Pre-fill 0-23 with zero counts per status
        Map<Integer, HourlyStatDTO> hourMap = new LinkedHashMap<>();
        for (int h = 0; h < 24; h++) {
            hourMap.put(h, new HourlyStatDTO(h, 0L, 0L, 0L));
        }

        for (Object[] row : rows) {
            int hour = ((Number) row[0]).intValue();
            String statusStr = String.valueOf(row[1]);
            long cnt = ((Number) row[2]).longValue();

            HourlyStatDTO dto = hourMap.get(hour);
            switch (statusStr) {
                case "SUCCESS" -> dto.setSuccessCount(dto.getSuccessCount() + cnt);
                case "FAILED" -> dto.setFailedCount(dto.getFailedCount() + cnt);
                case "PENDING" -> dto.setPendingCount(dto.getPendingCount() + cnt);
                default -> { /* ignore unknown */ }
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
