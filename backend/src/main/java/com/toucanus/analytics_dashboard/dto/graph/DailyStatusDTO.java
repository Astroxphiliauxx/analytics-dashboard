package com.toucanus.analytics_dashboard.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatusDTO {
    private LocalDate date;
    private Long successCount;
    private Long failedCount;
    private Long pendingCount;
    private BigDecimal totalAmount;
    private Long txnCount;
}
