package com.toucanus.analytics_dashboard.service;

import com.toucanus.analytics_dashboard.dto.DashboardStatsDTO;
import com.toucanus.analytics_dashboard.enums.TxnStatus;
import com.toucanus.analytics_dashboard.repository.TransactionRepository;
import com.toucanus.analytics_dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalTxns = transactionRepository.count();

        long newUsersToday = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(1));

        Long pendingTxns = transactionRepository.countByStatus(TxnStatus.PENDING);
        if (pendingTxns == null) {
            pendingTxns = 0L;
        }

        Long successTxns = transactionRepository.countByStatus(TxnStatus.SUCCESS);
        if (successTxns == null) {
            successTxns = 0L;
        }

        BigDecimal totalGtv = transactionRepository.selectSumAmountByStatus(TxnStatus.SUCCESS);
        if (totalGtv == null) {
            totalGtv = BigDecimal.ZERO;
        }

        BigDecimal totalFailedVolume = transactionRepository.selectSumAmountByStatus(TxnStatus.FAILED);
        if (totalFailedVolume == null) {
            totalFailedVolume = BigDecimal.ZERO;
        }

        BigDecimal averageTicketSize = BigDecimal.ZERO;
        if (successTxns > 0) {
            averageTicketSize = totalGtv.divide(BigDecimal.valueOf(successTxns), new MathContext(16, RoundingMode.HALF_UP));
        }

        double successRate = (totalTxns == 0)
                ? 0.0
                : (successTxns.doubleValue() * 100.0) / (double) totalTxns;

        return new DashboardStatsDTO(
                totalUsers,
                newUsersToday,
                totalTxns,
                pendingTxns,
                totalGtv,
                averageTicketSize,
                totalFailedVolume,
                successRate
        );
    }

    /**
     * Get dashboard stats filtered by date range.
     *
     * @param startDate the start date (inclusive)
     * @param endDate   the end date (inclusive)
     */
    public DashboardStatsDTO getDashboardStats(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(30);
        }

        long totalUsers = userRepository.count();
        Long totalTxns = transactionRepository.countInRange(startDate, endDate);
        if (totalTxns == null) {
            totalTxns = 0L;
        }

        long newUsersToday = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(1));

        Long pendingTxns = transactionRepository.countByStatusInRange(TxnStatus.PENDING, startDate, endDate);
        if (pendingTxns == null) {
            pendingTxns = 0L;
        }

        Long successTxns = transactionRepository.countByStatusInRange(TxnStatus.SUCCESS, startDate, endDate);
        if (successTxns == null) {
            successTxns = 0L;
        }

        BigDecimal totalGtv = transactionRepository.selectSumAmountByStatusInRange(TxnStatus.SUCCESS, startDate, endDate);
        if (totalGtv == null) {
            totalGtv = BigDecimal.ZERO;
        }

        BigDecimal totalFailedVolume = transactionRepository.selectSumAmountByStatusInRange(TxnStatus.FAILED, startDate, endDate);
        if (totalFailedVolume == null) {
            totalFailedVolume = BigDecimal.ZERO;
        }

        BigDecimal averageTicketSize = BigDecimal.ZERO;
        if (successTxns > 0) {
            averageTicketSize = totalGtv.divide(BigDecimal.valueOf(successTxns), new MathContext(16, RoundingMode.HALF_UP));
        }

        double successRate = (totalTxns == 0)
                ? 0.0
                : (successTxns.doubleValue() * 100.0) / (double) totalTxns;

        return new DashboardStatsDTO(
                totalUsers,
                newUsersToday,
                totalTxns,
                pendingTxns,
                totalGtv,
                averageTicketSize,
                totalFailedVolume,
                successRate
        );
    }
}
