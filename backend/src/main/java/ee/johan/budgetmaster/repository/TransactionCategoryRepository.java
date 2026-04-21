package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionCategoryRepository extends JpaRepository<TransactionCategory, Long> {
}
