package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;

public record NetWorthDto(
        String yearMonth,
        BigDecimal netWorth
) {}
