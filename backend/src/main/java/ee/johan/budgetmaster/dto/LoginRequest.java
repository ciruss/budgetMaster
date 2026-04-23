package ee.johan.budgetmaster.dto;

public record LoginRequest(
        String email,
        String password
) {
}
