package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record UserDto(
        Long id,
        String email,
        BigDecimal defaultSpendingLimit,
        Instant createdAt
) {}
