package com.toucanus.analytics_dashboard.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HourlyStatDTO {
    private int hour;
    private Long successCount;
    private Long failedCount;
    private Long pendingCount;
}
