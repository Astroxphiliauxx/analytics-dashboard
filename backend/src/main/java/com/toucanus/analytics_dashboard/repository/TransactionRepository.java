package com.toucanus.analytics_dashboard.repository;

import com.toucanus.analytics_dashboard.dto.graph.PaymentStatDTO;
import com.toucanus.analytics_dashboard.enums.TxnStatus;
import com.toucanus.analytics_dashboard.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

	/**
	 * Single optimized query to get all dashboard stats at once.
	 * Returns [totalTxns, successCount, pendingCount, failedCount, successAmount, failedAmount]
	 */
	@Query(value = """
	    SELECT 
	        COUNT(*) as totalTxns,
	        COUNT(*) FILTER (WHERE status = 'SUCCESS') as successCount,
	        COUNT(*) FILTER (WHERE status = 'PENDING') as pendingCount,
	        COUNT(*) FILTER (WHERE status = 'FAILED') as failedCount,
	        COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCESS'), 0) as successAmount,
	        COALESCE(SUM(amount) FILTER (WHERE status = 'FAILED'), 0) as failedAmount
	    FROM transactions
	    """, nativeQuery = true)
	List<Object[]> getAggregatedStats();

	/**
	 * Single optimized query to get all dashboard stats for a date range.
	 * Returns [totalTxns, successCount, pendingCount, failedCount, successAmount, failedAmount]
	 */
	@Query(value = """
	    SELECT 
	        COUNT(*) as totalTxns,
	        COUNT(*) FILTER (WHERE status = 'SUCCESS') as successCount,
	        COUNT(*) FILTER (WHERE status = 'PENDING') as pendingCount,
	        COUNT(*) FILTER (WHERE status = 'FAILED') as failedCount,
	        COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCESS'), 0) as successAmount,
	        COALESCE(SUM(amount) FILTER (WHERE status = 'FAILED'), 0) as failedAmount
	    FROM transactions
	    WHERE created_at::date BETWEEN :startDate AND :endDate
	    """, nativeQuery = true)
	List<Object[]> getAggregatedStatsInRange(@Param("startDate") java.time.LocalDate startDate,
	                                    @Param("endDate") java.time.LocalDate endDate);

	@Query("select coalesce(sum(t.amount), 0) from Transaction t where t.status = :status")
	BigDecimal selectSumAmountByStatus(@Param("status") TxnStatus status);

	@Query("select coalesce(sum(t.amount), 0) from Transaction t where t.status = :status and cast(t.createdAt as date) between :startDate and :endDate")
	BigDecimal selectSumAmountByStatusInRange(@Param("status") TxnStatus status,
	                                           @Param("startDate") java.time.LocalDate startDate,
	                                           @Param("endDate") java.time.LocalDate endDate);

	@Query("select count(t) from Transaction t where t.status = :status")
	Long countByStatus(@Param("status") TxnStatus status);

	@Query("select count(t) from Transaction t where t.status = :status and cast(t.createdAt as date) between :startDate and :endDate")
	Long countByStatusInRange(@Param("status") TxnStatus status,
	                          @Param("startDate") java.time.LocalDate startDate,
	                          @Param("endDate") java.time.LocalDate endDate);

	@Query("select count(t) from Transaction t where cast(t.createdAt as date) between :startDate and :endDate")
	Long countInRange(@Param("startDate") java.time.LocalDate startDate,
	                  @Param("endDate") java.time.LocalDate endDate);

    /**
     * Optimized daily stats query that returns all needed data in one query.
     * Returns [date, txnCount, totalAmount, successCount, failedCount, pendingCount].
     */
    @Query(value = """
	    SELECT 
	        created_at::date as day,
	        COUNT(*) as txnCount,
	        COALESCE(SUM(amount), 0) as totalAmount,
	        COUNT(*) FILTER (WHERE status = 'SUCCESS') as successCount,
	        COUNT(*) FILTER (WHERE status = 'FAILED') as failedCount,
	        COUNT(*) FILTER (WHERE status = 'PENDING') as pendingCount
	    FROM transactions
	    WHERE created_at::date BETWEEN :startDate AND :endDate
	    GROUP BY created_at::date
	    ORDER BY day
	    """, nativeQuery = true)
    List<Object[]> selectOptimizedDailyStats(@Param("startDate") java.time.LocalDate startDate,
                                              @Param("endDate") java.time.LocalDate endDate);

	    @Query(value = """
		    select cast(t.created_at as date) as day,
			   coalesce(sum(t.amount), 0) as totalAmount,
			   count(*) as txnCount
		    from transactions t
		    where cast(t.created_at as date) between :startDate and :endDate
		    group by cast(t.created_at as date)
		    order by day
		    """, nativeQuery = true)
	    List<Object[]> selectDailyStatsInRange(@Param("startDate") java.time.LocalDate startDate,
	                                         @Param("endDate") java.time.LocalDate endDate);

	    @Query("select new com.toucanus.analytics_dashboard.dto.graph.PaymentStatDTO(t.paymentMethod, count(t)) " +
		    "from Transaction t group by t.paymentMethod")
	    List<PaymentStatDTO> selectPaymentMethodStats();

    @Query("select new com.toucanus.analytics_dashboard.dto.graph.PaymentStatDTO(t.paymentMethod, count(t)) " +
	    "from Transaction t where cast(t.createdAt as date) between :startDate and :endDate group by t.paymentMethod")
    List<PaymentStatDTO> selectPaymentMethodStatsInRange(@Param("startDate") java.time.LocalDate startDate,
                                                          @Param("endDate") java.time.LocalDate endDate);

	    /**
	     * Daily status breakdown for stacked bar chart.
	     * Returns [date, status, count].
	     */
	    @Query(value = """
		    select cast(t.created_at as date) as day,
			   t.status,
			   count(*) as cnt
		    from transactions t
		    where cast(t.created_at as date) between :startDate and :endDate
		    group by cast(t.created_at as date), t.status
		    order by day
		    """, nativeQuery = true)
	    List<Object[]> selectDailyStatusStats(@Param("startDate") java.time.LocalDate startDate,
	                                          @Param("endDate") java.time.LocalDate endDate);

	    /**
	     * Hourly traffic distribution for a specific date, grouped by hour and status.
	     * Returns [hour, status, count].
	     */
	    @Query(value = """
		    select extract(hour from t.created_at) as hour,
			   t.status,
			   count(*) as cnt
		    from transactions t
		    where cast(t.created_at as date) = :date
		    group by extract(hour from t.created_at), t.status
		    """, nativeQuery = true)
	    List<Object[]> selectHourlyTrafficStatsByDate(@Param("date") java.time.LocalDate date);

    /**
     * Optimized hourly traffic query returning all status counts in one query.
     * Returns [hour, successCount, failedCount, pendingCount].
     */
    @Query(value = """
	    SELECT 
	        EXTRACT(HOUR FROM created_at)::int as hour,
	        COUNT(*) FILTER (WHERE status = 'SUCCESS') as successCount,
	        COUNT(*) FILTER (WHERE status = 'FAILED') as failedCount,
	        COUNT(*) FILTER (WHERE status = 'PENDING') as pendingCount
	    FROM transactions
	    WHERE created_at::date BETWEEN :startDate AND :endDate
	    GROUP BY EXTRACT(HOUR FROM created_at)
	    ORDER BY hour
	    """, nativeQuery = true)
    List<Object[]> selectOptimizedHourlyStats(@Param("startDate") java.time.LocalDate startDate,
                                               @Param("endDate") java.time.LocalDate endDate);

    /**
     * Hourly traffic distribution for a date range, grouped by hour and status.
     * Returns [hour, status, count].
     */
    @Query(value = """
	    select extract(hour from t.created_at) as hour,
		   t.status,
		   count(*) as cnt
	    from transactions t
	    where cast(t.created_at as date) between :startDate and :endDate
	    group by extract(hour from t.created_at), t.status
	    """, nativeQuery = true)
    List<Object[]> selectHourlyTrafficStatsInRange(@Param("startDate") java.time.LocalDate startDate,
                                                    @Param("endDate") java.time.LocalDate endDate);
}
