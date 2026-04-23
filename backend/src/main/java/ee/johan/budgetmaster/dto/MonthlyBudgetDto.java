package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;

public record MonthlyBudgetDto(
        Long id,
        String yearMonth,
        BigDecimal spendingLimit,
        Long userId
) {}
