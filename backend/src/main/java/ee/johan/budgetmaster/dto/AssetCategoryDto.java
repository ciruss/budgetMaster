package ee.johan.budgetmaster.dto;

public record AssetCategoryDto(
        Long id,
        String name,
        AssetType type
) {}
