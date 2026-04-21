package ee.johan.budgetmaster.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private BigDecimal defaultSpendingLimit;

    private Instant createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Asset> assets;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<MonthlyBudget> monthlyBudgets;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<TransactionCategory> transactionCategories;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
}
