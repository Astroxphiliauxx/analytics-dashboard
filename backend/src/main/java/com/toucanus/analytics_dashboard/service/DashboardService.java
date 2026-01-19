package com.toucanus.analytics_dashboard.service;

import com.toucanus.analytics_dashboard.dto.DashboardStatsDTO;
import com.toucanus.analytics_dashboard.dto.DailyStatDTO;
import com.toucanus.analytics_dashboard.dto.PaymentStatDTO;
import com.toucanus.analytics_dashboard.enums.TxnStatus;
import com.toucanus.analytics_dashboard.repository.TransactionRepository;
import com.toucanus.analytics_dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
            // Use MathContext to avoid ArithmeticException on non-terminating decimals.
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

    public List<DailyStatDTO> getDailyStats() {
        List<Object[]> rows = transactionRepository.selectDailyStatsLast7Days();
        List<DailyStatDTO> result = new ArrayList<>(rows.size());

        for (Object[] row : rows) {
            LocalDate day;
            Object dayObj = row[0];
            if (dayObj instanceof LocalDate localDate) {
                day = localDate;
            } else if (dayObj instanceof Date sqlDate) {
                day = sqlDate.toLocalDate();
            } else {
                day = LocalDate.parse(String.valueOf(dayObj));
            }

            BigDecimal totalAmount = (row[1] instanceof BigDecimal bd)
                    ? bd
                    : new BigDecimal(String.valueOf(row[1]));

            long txnCount = (row[2] instanceof Number n)
                    ? n.longValue()
                    : Long.parseLong(String.valueOf(row[2]));

            result.add(new DailyStatDTO(day, totalAmount, txnCount));
        }

        return result;
    }

    public List<PaymentStatDTO> getPaymentStats() {
        return transactionRepository.selectPaymentMethodStats();
    }
}
