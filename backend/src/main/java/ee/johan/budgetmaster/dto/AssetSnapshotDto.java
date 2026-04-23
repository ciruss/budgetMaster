package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetSnapshotDto(
        Long id,
        LocalDate snapshotDate,
        BigDecimal balance,
        Long assetId
) {}
