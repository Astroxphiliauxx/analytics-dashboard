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
