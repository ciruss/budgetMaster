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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private AssetRepository assetRepository;
    @Mock
    private AssetSnapshotRepository assetSnapshotRepository;
    @Mock
    private BudgetService budgetService;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SummaryService summaryService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setDefaultSpendingLimit(new BigDecimal("1000.00"));
    }

    @Test
    void testSummarize_MathIsCorrect() {
        String ym = "2023-10";
        YearMonth yearMonth = YearMonth.parse(ym);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Transaction t1 = new Transaction();
        t1.setType(TransactionType.INCOME);
        t1.setAmount(new BigDecimal("5000.00"));

        Transaction t2 = new Transaction();
        t2.setType(TransactionType.EXPENSE);
        t2.setAmount(new BigDecimal("1500.00"));

        Transaction t3 = new Transaction();
        t3.setType(TransactionType.INVESTMENT);
        t3.setAmount(new BigDecimal("1000.00"));

        when(transactionRepository.findByUserIdAndDateBetween(1L, start, end))
                .thenReturn(List.of(t1, t2, t3));

        when(budgetService.getBudget(1L, ym))
                .thenReturn(Optional.empty()); // Fallback to user default 1000.00

        Asset asset = new Asset();
        asset.setId(10L);
        asset.setKind(AssetType.ASSET);
        when(assetRepository.findByUserId(1L)).thenReturn(List.of(asset));

        AssetSnapshot snapshot = new AssetSnapshot();
        snapshot.setBalance(new BigDecimal("10000.00"));
        when(assetSnapshotRepository.findFirstByAssetIdAndSnapshotDateLessThanEqualOrderBySnapshotDateDesc(eq(10L), eq(end)))
                .thenReturn(Optional.of(snapshot));

        SummaryDto summary = summaryService.summarize(1L, ym);

        assertEquals(new BigDecimal("5000.00"), summary.income());
        assertEquals(new BigDecimal("1500.00"), summary.expenses());
        assertEquals(new BigDecimal("1000.00"), summary.invested());

        // savings = 5000 - 1500 - 1000 = 2500
        assertEquals(new BigDecimal("2500.00"), summary.savings());

        // savingsRate = (2500 + 1000) / 5000 = 0.7000
        assertEquals(new BigDecimal("0.7000"), summary.savingsRate());

        // budgetRemaining = 1000 - 1500 = -500
        assertEquals(new BigDecimal("-500.00"), summary.budgetRemaining());

        // netWorth = 10000
        assertEquals(new BigDecimal("10000.00"), summary.netWorth());
    }
}
