package com.analytics.dashboard.repository;

import com.analytics.dashboard.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    // Basic CRUD is provided by JpaRepository
}
