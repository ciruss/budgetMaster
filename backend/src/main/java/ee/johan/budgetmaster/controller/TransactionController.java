package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.CreateTransactionRequest;
import ee.johan.budgetmaster.dto.TransactionDto;
import ee.johan.budgetmaster.dto.UpdateTransactionRequest;
import ee.johan.budgetmaster.service.TransactionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    private Long getCurrentUserId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
    }

    @GetMapping
    public ResponseEntity<List<TransactionDto>> listTransactions(
            @RequestParam("month") String month) {
        return ResponseEntity.ok(transactionService.listByMonth(getCurrentUserId(), month));
    }

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(
            @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.create(getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(
            @PathVariable Long id,
            @RequestBody UpdateTransactionRequest request) {
        return ResponseEntity.ok(transactionService.update(id, getCurrentUserId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id) {
        transactionService.delete(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
