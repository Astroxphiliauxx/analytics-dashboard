package com.toucanus.analytics_dashboard.entity;

import com.toucanus.analytics_dashboard.enums.PaymentMethod;
import com.toucanus.analytics_dashboard.enums.TxnStatus;
import com.toucanus.analytics_dashboard.enums.TxnType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_txn_status", columnList = "status"),
    @Index(name = "idx_txn_created_at", columnList = "created_at"),
    @Index(name = "idx_txn_payment_method", columnList = "payment_method"),
    @Index(name = "idx_txn_status_created", columnList = "status, created_at"),
    @Index(name = "idx_txn_created_status", columnList = "created_at, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TxnType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TxnStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
