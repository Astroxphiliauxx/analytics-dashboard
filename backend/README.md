# Analytics Dashboard API

Base URL: http://localhost:8080

## Dashboard

| Endpoint (GET) | Result | Service / DTO |
| --- | --- | --- |
| http://loc    alhost:8080/api/dashboard/stats | `DashboardStatsDTO` (totals, newUsersToday, pendingTrxns, totalGtv, averageTicketSize, totalFailedVolume, successRate) | DashboardService.getDashboardStats() → DashboardStatsDTO |
| http://localhost:8080/api/dashboard/analytics/daily?date=YYYY-MM-DD (optional) | `List<DailyStatusDTO>` (7 items ending on date/today; successCount, failedCount, pendingCount, totalAmount, txnCount per day) | GraphAnalyticsService.getDailyStatusStats(LocalDate) → com.toucanus.analytics_dashboard.dto.graph.DailyStatusDTO |
| http://localhost:8080/api/dashboard/analytics/payment-methods | `List<PaymentStatDTO>` (paymentMethod, count) | GraphAnalyticsService.getPaymentStats() → com.toucanus.analytics_dashboard.dto.graph.PaymentStatDTO |
| http://localhost:8080/api/dashboard/analytics/hourly-traffic?date=YYYY-MM-DD (optional) | `List<HourlyStatDTO>` (24 items; successCount, failedCount, pendingCount per hour 0–23) | GraphAnalyticsService.getHourlyTrafficStats(LocalDate) → com.toucanus.analytics_dashboard.dto.graph.HourlyStatDTO |

## Transactions

| Endpoint (GET) | Result | Service / DTO |
| --- | --- | --- |
| http://localhost:8080/api/transactions?page=0&size=10&status=SUCCESS&paymentMethod=CARD&minAmount=100&maxAmount=500&startDate=2026-01-01T00:00:00&endDate=2026-01-19T23:59:59&userEmail=test@example.com | `Page<TransactionListItemDTO>` (id, userId, userEmail, userFullName, amount, currency, type, status, paymentMethod, createdAt) | TransactionController → TransactionRepository.findAll(spec, pageable) with TransactionSpecification.getSpec(criteria) → TransactionListItemDTO (criteria bound from TransactionSearchCriteria) |
