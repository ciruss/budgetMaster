package ee.johan.budgetmaster.dto;

public record TransactionCategoryDto(
        Long id,
        String name,
        TransactionCategoryType type,
        Long parentCategoryId,
        Long userId
) {}
