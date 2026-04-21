package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {
    Optional<MonthlyBudget> findByUserIdAndYearMonth(Long userId, String yearMonth);
}
