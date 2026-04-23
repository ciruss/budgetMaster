package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;

public record SummaryDto(
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal invested,
        BigDecimal savings,
        BigDecimal savingsRate,
        BigDecimal budgetRemaining,
        BigDecimal netWorth
) {}
