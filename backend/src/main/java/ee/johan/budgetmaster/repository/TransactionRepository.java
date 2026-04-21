package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<List<Transaction>> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
