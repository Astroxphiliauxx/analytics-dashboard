package com.toucanus.analytics_dashboard.dto;

import com.toucanus.analytics_dashboard.enums.PaymentMethod;
import com.toucanus.analytics_dashboard.enums.TxnStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSearchCriteria {

    private TxnStatus status;

    private PaymentMethod paymentMethod;

    private BigDecimal minAmount;

    private BigDecimal maxAmount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    /**
     * Filter transactions by associated user's email.
     */
    private String userEmail;
}
