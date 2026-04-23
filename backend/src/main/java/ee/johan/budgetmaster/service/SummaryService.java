package ee.johan.budgetmaster.service;

import ee.johan.budgetmaster.dto.*;
import ee.johan.budgetmaster.entity.Asset;
import ee.johan.budgetmaster.entity.AssetSnapshot;
import ee.johan.budgetmaster.entity.Transaction;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.AssetRepository;
import ee.johan.budgetmaster.repository.AssetSnapshotRepository;
import ee.johan.budgetmaster.repository.TransactionRepository;
import ee.johan.budgetmaster.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class SummaryService {

    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;
    private final AssetSnapshotRepository assetSnapshotRepository;
    private final BudgetService budgetService;
    private final UserRepository userRepository;

    public SummaryDto summarize(Long userId, String yearMonthStr) {
        User user = userRepository.findById(userId).orElseThrow();
        YearMonth ym = YearMonth.parse(yearMonthStr);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expenses = BigDecimal.ZERO;
        BigDecimal invested = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                income = income.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                expenses = expenses.add(t.getAmount());
            } else if (t.getType() == TransactionType.INVESTMENT) {
                invested = invested.add(t.getAmount());
            }
        }

        BigDecimal savings = income.subtract(expenses).subtract(invested);
        
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = savings.add(invested)
                    .divide(income, 4, RoundingMode.HALF_UP);
        }

        BigDecimal spendingLimit = budgetService.getBudget(userId, yearMonthStr)
                .map(MonthlyBudgetDto::spendingLimit)
                .orElse(user.getDefaultSpendingLimit() != null ? user.getDefaultSpendingLimit() : BigDecimal.ZERO);

        BigDecimal budgetRemaining = spendingLimit.subtract(expenses);

        BigDecimal netWorth = calculateNetWorthAt(userId, end);

        return new SummaryDto(income, expenses, invested, savings, savingsRate, budgetRemaining, netWorth);
    }

    public List<NetWorthDto> getNetWorthHistory(Long userId, String from, String to) {
        YearMonth start = YearMonth.parse(from);
        YearMonth end = YearMonth.parse(to);
        List<NetWorthDto> history = new ArrayList<>();

        YearMonth current = start;
        while (!current.isAfter(end)) {
            LocalDate endOfMonth = current.atEndOfMonth();
            BigDecimal netWorth = calculateNetWorthAt(userId, endOfMonth);
            history.add(new NetWorthDto(current.toString(), netWorth));
            current = current.plusMonths(1);
        }

        return history;
    }

    private BigDecimal calculateNetWorthAt(Long userId, LocalDate date) {
        List<Asset> assets = assetRepository.findByUserId(userId);
        BigDecimal netWorth = BigDecimal.ZERO;

        for (Asset asset : assets) {
            Optional<AssetSnapshot> latestSnapshot = assetSnapshotRepository
                    .findFirstByAssetIdAndSnapshotDateLessThanEqualOrderBySnapshotDateDesc(asset.getId(), date);
            
            if (latestSnapshot.isPresent()) {
                BigDecimal balance = latestSnapshot.get().getBalance();
                if (asset.getKind() == AssetType.LIABILITY) {
                    netWorth = netWorth.subtract(balance);
                } else {
                    netWorth = netWorth.add(balance);
                }
            }
        }

        return netWorth;
    }
}
