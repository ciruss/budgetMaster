package ee.johan.budgetmaster.service;

import ee.johan.budgetmaster.dto.CreateTransactionCategoryRequest;
import ee.johan.budgetmaster.dto.TransactionCategoryDto;
import ee.johan.budgetmaster.entity.TransactionCategory;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.TransactionCategoryRepository;
import ee.johan.budgetmaster.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionCategoryService {

    private final TransactionCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionCategoryService(TransactionCategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<TransactionCategoryDto> listByUser(Long userId) {
        return categoryRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TransactionCategoryDto create(Long userId, CreateTransactionCategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TransactionCategory category = new TransactionCategory();
        category.setName(request.name());
        category.setType(request.type());
        category.setUser(user);

        if (request.parentCategoryId() != null) {
            TransactionCategory parent = categoryRepository.findById(request.parentCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found"));
            category.setCategory(parent);
        }

        return toDto(categoryRepository.save(category));
    }

    public void delete(Long userId, Long categoryId) {
        TransactionCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        
        if (!category.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this category");
        }
        
        categoryRepository.delete(category);
    }

    private TransactionCategoryDto toDto(TransactionCategory category) {
        Long parentId = category.getCategory() != null ? category.getCategory().getId() : null;
        return new TransactionCategoryDto(
                category.getId(),
                category.getName(),
                category.getType(),
                parentId,
                category.getUser().getId()
        );
    }
}
