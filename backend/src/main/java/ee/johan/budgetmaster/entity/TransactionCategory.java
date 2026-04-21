package ee.johan.budgetmaster.entity;

import ee.johan.budgetmaster.dto.TransactionCategoryType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class TransactionCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Enumerated(EnumType.STRING)
    private TransactionCategoryType type;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private TransactionCategory category;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
