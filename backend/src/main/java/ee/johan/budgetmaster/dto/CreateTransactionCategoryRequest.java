package ee.johan.budgetmaster.dto;

public record CreateTransactionCategoryRequest(
        String name,
        TransactionCategoryType type,
        Long parentCategoryId
) {}
