package ee.johan.budgetmaster.dto;

public record CreateAssetRequest(
        String name,
        AssetType kind,
        Long categoryId
) {}
