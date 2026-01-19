package com.toucanus.analytics_dashboard.repository;

import com.toucanus.analytics_dashboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	long countByCreatedAtAfter(LocalDateTime date);
}
