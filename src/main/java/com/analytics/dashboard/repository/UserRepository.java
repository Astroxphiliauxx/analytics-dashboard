package com.analytics.dashboard.repository;

import com.analytics.dashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Basic CRUD is provided by JpaRepository
}
