package ee.johan.budgetmaster.dto;

public record SignupRequest(
        String email,
        String password
) {
}
