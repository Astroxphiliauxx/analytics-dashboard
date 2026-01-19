package com.toucanus.analytics_dashboard.dto.graph;

import com.toucanus.analytics_dashboard.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatDTO {

    private PaymentMethod paymentMethod;

    private Long count;
}
