package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionCategoryRepository extends JpaRepository<TransactionCategory, Long> {
    List<TransactionCategory> findByUserId(Long userId);
}
