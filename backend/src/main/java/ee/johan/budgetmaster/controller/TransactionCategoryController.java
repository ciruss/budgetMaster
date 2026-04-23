package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.CreateTransactionCategoryRequest;
import ee.johan.budgetmaster.dto.TransactionCategoryDto;
import ee.johan.budgetmaster.service.TransactionCategoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/categories")
public class TransactionCategoryController {

    private final TransactionCategoryService categoryService;

    private Long getCurrentUserId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
    }

    @GetMapping
    public ResponseEntity<List<TransactionCategoryDto>> listCategories() {
        return ResponseEntity.ok(categoryService.listByUser(getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<TransactionCategoryDto> createCategory(
            @RequestBody CreateTransactionCategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(getCurrentUserId(), request));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long categoryId) {
        categoryService.delete(getCurrentUserId(), categoryId);
        return ResponseEntity.noContent().build();
    }
}
