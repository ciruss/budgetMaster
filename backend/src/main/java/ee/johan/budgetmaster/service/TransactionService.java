package ee.johan.budgetmaster.service;

import ee.johan.budgetmaster.dto.CreateTransactionRequest;
import ee.johan.budgetmaster.dto.TransactionDto;
import ee.johan.budgetmaster.dto.UpdateTransactionRequest;
import ee.johan.budgetmaster.entity.Asset;
import ee.johan.budgetmaster.entity.Transaction;
import ee.johan.budgetmaster.entity.TransactionCategory;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.AssetRepository;
import ee.johan.budgetmaster.repository.TransactionCategoryRepository;
import ee.johan.budgetmaster.repository.TransactionRepository;
import ee.johan.budgetmaster.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@AllArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionCategoryRepository categoryRepository;
    private final AssetRepository assetRepository;

    @Transactional(readOnly = true)
    public List<TransactionDto> listByMonth(Long userId, String yearMonthStr) {
        YearMonth yearMonth = YearMonth.parse(yearMonthStr);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        return transactionRepository.findByUserIdAndDateBetween(userId, start, end)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public TransactionDto create(Long userId, CreateTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TransactionCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Asset asset = null;
        if (request.assetId() != null) {
            asset = assetRepository.findById(request.assetId())
                    .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        }

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setAsset(asset);
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDate(request.date());

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    @Transactional
    public TransactionDto update(Long id, Long userId, UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found or not owned by user"));

        TransactionCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Asset asset = null;
        if (request.assetId() != null) {
            asset = assetRepository.findById(request.assetId())
                    .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        }

        transaction.setCategory(category);
        transaction.setAsset(asset);
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setDate(request.date());

        Transaction updated = transactionRepository.save(transaction);
        return mapToDto(updated);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found or not owned by user"));
        transactionRepository.delete(transaction);
    }

    private TransactionDto mapToDto(Transaction transaction) {
        Long categoryId = transaction.getCategory() != null ? transaction.getCategory().getId() : null;
        Long assetId = transaction.getAsset() != null ? transaction.getAsset().getId() : null;
        Long userId = transaction.getUser() != null ? transaction.getUser().getId() : null;

        return new TransactionDto(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getDate(),
                categoryId,
                assetId,
                userId
        );
    }
}
