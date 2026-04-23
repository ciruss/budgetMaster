package ee.johan.budgetmaster.service;

import ee.johan.budgetmaster.dto.AssetDto;
import ee.johan.budgetmaster.dto.AssetSnapshotDto;
import ee.johan.budgetmaster.dto.CreateAssetRequest;
import ee.johan.budgetmaster.dto.CreateAssetSnapshotRequest;
import ee.johan.budgetmaster.entity.Asset;
import ee.johan.budgetmaster.entity.AssetCategory;
import ee.johan.budgetmaster.entity.AssetSnapshot;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.AssetCategoryRepository;
import ee.johan.budgetmaster.repository.AssetRepository;
import ee.johan.budgetmaster.repository.AssetSnapshotRepository;
import ee.johan.budgetmaster.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetSnapshotRepository assetSnapshotRepository;
    private final UserRepository userRepository;
    private final AssetCategoryRepository assetCategoryRepository;

    public AssetService(AssetRepository assetRepository, AssetSnapshotRepository assetSnapshotRepository,
                        UserRepository userRepository, AssetCategoryRepository assetCategoryRepository) {
        this.assetRepository = assetRepository;
        this.assetSnapshotRepository = assetSnapshotRepository;
        this.userRepository = userRepository;
        this.assetCategoryRepository = assetCategoryRepository;
    }

    public List<AssetDto> listByUser(Long userId) {
        return assetRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AssetDto createAsset(Long userId, CreateAssetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Asset asset = new Asset();
        asset.setName(request.name());
        asset.setKind(request.kind());
        asset.setUser(user);

        if (request.categoryId() != null) {
            AssetCategory category = assetCategoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            asset.setCategory(category);
        }

        return toDto(assetRepository.save(asset));
    }

    public void deleteAsset(Long userId, Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        if (!asset.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        assetRepository.delete(asset);
    }

    public List<AssetSnapshotDto> listSnapshots(Long userId, Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        if (!asset.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        return assetSnapshotRepository.findByAssetIdOrderBySnapshotDateDesc(assetId).stream()
                .map(this::toSnapshotDto)
                .collect(Collectors.toList());
    }

    public AssetSnapshotDto createSnapshot(Long userId, Long assetId, CreateAssetSnapshotRequest request) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));

        if (!asset.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        AssetSnapshot snapshot = new AssetSnapshot();
        snapshot.setAsset(asset);
        snapshot.setSnapshotDate(request.snapshotDate());
        snapshot.setBalance(request.balance());

        return toSnapshotDto(assetSnapshotRepository.save(snapshot));
    }

    private AssetDto toDto(Asset asset) {
        Long categoryId = asset.getCategory() != null ? asset.getCategory().getId() : null;
        return new AssetDto(
                asset.getId(),
                asset.getName(),
                asset.getKind(),
                categoryId,
                asset.getUser().getId()
        );
    }

    private AssetSnapshotDto toSnapshotDto(AssetSnapshot snapshot) {
        return new AssetSnapshotDto(
                snapshot.getId(),
                snapshot.getSnapshotDate(),
                snapshot.getBalance(),
                snapshot.getAsset().getId()
        );
    }
}
