package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {
}
