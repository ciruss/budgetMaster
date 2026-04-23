package ee.johan.budgetmaster.repository;

import ee.johan.budgetmaster.entity.AssetSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AssetSnapshotRepository extends JpaRepository<AssetSnapshot, Long> {
    List<AssetSnapshot> findByAssetIdOrderBySnapshotDateDesc(Long assetId);
    Optional<AssetSnapshot> findFirstByAssetIdAndSnapshotDateLessThanEqualOrderBySnapshotDateDesc(Long assetId, LocalDate date);
}
