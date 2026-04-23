package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.MonthlyBudgetDto;
import ee.johan.budgetmaster.dto.UpsertBudgetRequest;
import ee.johan.budgetmaster.service.BudgetService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    private Long getCurrentUserId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
    }

    @GetMapping("/{yearMonth}")
    public ResponseEntity<MonthlyBudgetDto> getBudget(@PathVariable String yearMonth) {
        return budgetService.getBudget(getCurrentUserId(), yearMonth)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{yearMonth}")
    public ResponseEntity<MonthlyBudgetDto> upsertBudget(
            @PathVariable String yearMonth,
            @RequestBody UpsertBudgetRequest request) {
        return ResponseEntity.ok(budgetService.upsertBudget(getCurrentUserId(), yearMonth, request));
    }
}
