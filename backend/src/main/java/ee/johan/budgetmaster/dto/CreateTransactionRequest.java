package ee.johan.budgetmaster.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(
        BigDecimal amount,
        TransactionType type,
        LocalDate date,
        Long categoryId,
        Long assetId
) {}
