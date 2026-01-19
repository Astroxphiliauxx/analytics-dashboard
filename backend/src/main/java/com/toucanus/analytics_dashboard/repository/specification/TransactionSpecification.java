package com.toucanus.analytics_dashboard.repository.specification;

import com.toucanus.analytics_dashboard.dto.TransactionSearchCriteria;
import com.toucanus.analytics_dashboard.entity.Transaction;
import com.toucanus.analytics_dashboard.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class TransactionSpecification {

    private TransactionSpecification() {
    }

    public static Specification<Transaction> getSpec(TransactionSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            if (criteria == null) {
                return criteriaBuilder.conjunction();
            }

            var predicate = criteriaBuilder.conjunction();

            if (criteria.getStatus() != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("status"), criteria.getStatus()));
            }

            if (criteria.getPaymentMethod() != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("paymentMethod"), criteria.getPaymentMethod()));
            }

            String userEmail = criteria.getUserEmail();
            if (userEmail != null && !userEmail.trim().isEmpty()) {
                Join<Transaction, User> userJoin = root.join("user", JoinType.INNER);
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(userJoin.get("email"), userEmail.trim()));
            }

            BigDecimal minAmount = criteria.getMinAmount();
            BigDecimal maxAmount = criteria.getMaxAmount();
            if (minAmount != null && maxAmount != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.between(root.get("amount"), minAmount, maxAmount));
            } else if (minAmount != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), minAmount));
            } else if (maxAmount != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            LocalDateTime startDate = criteria.getStartDate();
            LocalDateTime endDate = criteria.getEndDate();
            if (startDate != null && endDate != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.between(root.get("createdAt"), startDate, endDate));
            } else if (startDate != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            } else if (endDate != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return predicate;
        };
    }
}
