package ee.johan.budgetmaster.entity;

import ee.johan.budgetmaster.dto.AssetType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class AssetCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Enumerated(EnumType.STRING)
    private AssetType type;

    @OneToMany(mappedBy = "category")
    private List<Asset> assets;
}
