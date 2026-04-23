package ee.johan.budgetmaster.service;

import ee.johan.budgetmaster.dto.MonthlyBudgetDto;
import ee.johan.budgetmaster.dto.UpsertBudgetRequest;
import ee.johan.budgetmaster.entity.MonthlyBudget;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.MonthlyBudgetRepository;
import ee.johan.budgetmaster.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BudgetService {

    private final MonthlyBudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetService(MonthlyBudgetRepository budgetRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    public Optional<MonthlyBudgetDto> getBudget(Long userId, String yearMonth) {
        return budgetRepository.findByUserIdAndYearMonth(userId, yearMonth)
                .map(this::toDto);
    }

    public MonthlyBudgetDto upsertBudget(Long userId, String yearMonth, UpsertBudgetRequest request) {
        Optional<MonthlyBudget> existing = budgetRepository.findByUserIdAndYearMonth(userId, yearMonth);
        MonthlyBudget budget;
        if (existing.isPresent()) {
            budget = existing.get();
        } else {
            budget = new MonthlyBudget();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            budget.setUser(user);
            budget.setYearMonth(yearMonth);
        }
        
        budget.setSpendingLimit(request.spendingLimit());
        return toDto(budgetRepository.save(budget));
    }

    private MonthlyBudgetDto toDto(MonthlyBudget budget) {
        return new MonthlyBudgetDto(
                budget.getId(),
                budget.getYearMonth(),
                budget.getSpendingLimit(),
                budget.getUser().getId()
        );
    }
}
