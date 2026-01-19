package com.toucanus.analytics_dashboard.controller;

import com.toucanus.analytics_dashboard.dto.TransactionListItemDTO;
import com.toucanus.analytics_dashboard.dto.TransactionSearchCriteria;
import com.toucanus.analytics_dashboard.entity.Transaction;
import com.toucanus.analytics_dashboard.entity.User;
import com.toucanus.analytics_dashboard.repository.TransactionRepository;
import com.toucanus.analytics_dashboard.repository.specification.TransactionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public Page<TransactionListItemDTO> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute TransactionSearchCriteria criteria
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Specification<Transaction> spec = TransactionSpecification.getSpec(criteria);
        Page<Transaction> txnPage = transactionRepository.findAll(spec, pageable);
        return txnPage.map(this::toDto);
    }

    private TransactionListItemDTO toDto(Transaction txn) {
        User user = txn.getUser();
        return new TransactionListItemDTO(
                txn.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getFullName() : null,
                txn.getAmount(),
                txn.getCurrency(),
                txn.getType(),
                txn.getStatus(),
                txn.getPaymentMethod(),
                txn.getCreatedAt()
        );
    }
}
