package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;

public record UpsertBudgetRequest(
        BigDecimal spendingLimit
) {}
