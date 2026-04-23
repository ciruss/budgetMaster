package ee.johan.budgetmaster.dto;

public record AssetDto(
        Long id,
        String name,
        Long categoryId,
        Long userId
) {}
