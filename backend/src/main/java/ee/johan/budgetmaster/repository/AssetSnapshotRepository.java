package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.AssetSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetSnapshotRepository extends JpaRepository<AssetSnapshot, Long> {
}
