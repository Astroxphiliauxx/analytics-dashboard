package com.toucanus.analytics_dashboard.service;

import com.toucanus.analytics_dashboard.dto.DashboardStatsDTO;
import com.toucanus.analytics_dashboard.enums.TxnStatus;
import com.toucanus.analytics_dashboard.repository.TransactionRepository;
import com.toucanus.analytics_dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalTxns = transactionRepository.count();

        Long successTxns = transactionRepository.countByStatus(TxnStatus.SUCCESS);
        if (successTxns == null) {
            successTxns = 0L;
        }

        BigDecimal totalGtv = transactionRepository.selectSumAmountByStatus(TxnStatus.SUCCESS);
        if (totalGtv == null) {
            totalGtv = BigDecimal.ZERO;
        }

        double successRate = (totalTxns == 0)
                ? 0.0
                : (successTxns.doubleValue() * 100.0) / (double) totalTxns;

        return new DashboardStatsDTO(
                totalUsers,
                totalTxns,
                totalGtv,
                successRate
        );
    }
}
