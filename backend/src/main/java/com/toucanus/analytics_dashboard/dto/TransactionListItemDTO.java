package com.toucanus.analytics_dashboard.dto;

import com.toucanus.analytics_dashboard.enums.PaymentMethod;
import com.toucanus.analytics_dashboard.enums.TxnStatus;
import com.toucanus.analytics_dashboard.enums.TxnType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lightweight DTO for the transaction list/data-grid view.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionListItemDTO {

    private UUID id;

    private Long userId;

    private String userEmail;

    private String userFullName;

    private BigDecimal amount;

    private String currency;

    private TxnType type;

    private TxnStatus status;

    private PaymentMethod paymentMethod;

    private LocalDateTime createdAt;
}
