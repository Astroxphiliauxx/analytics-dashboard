package com.toucanus.analytics_dashboard.repository;

import com.toucanus.analytics_dashboard.enums.TxnStatus;
import com.toucanus.analytics_dashboard.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

	@Query("select coalesce(sum(t.amount), 0) from Transaction t where t.status = :status")
	BigDecimal selectSumAmountByStatus(@Param("status") TxnStatus status);

	@Query("select count(t) from Transaction t where t.status = :status")
	Long countByStatus(@Param("status") TxnStatus status);
}

