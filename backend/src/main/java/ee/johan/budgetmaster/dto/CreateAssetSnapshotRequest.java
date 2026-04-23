package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateAssetSnapshotRequest(
        LocalDate snapshotDate,
        BigDecimal balance
) {}
