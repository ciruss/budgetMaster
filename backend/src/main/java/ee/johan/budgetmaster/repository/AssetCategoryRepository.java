package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
}
