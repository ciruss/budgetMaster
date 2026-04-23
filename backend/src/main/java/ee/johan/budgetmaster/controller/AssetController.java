package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.AssetDto;
import ee.johan.budgetmaster.dto.AssetSnapshotDto;
import ee.johan.budgetmaster.dto.CreateAssetRequest;
import ee.johan.budgetmaster.dto.CreateAssetSnapshotRequest;
import ee.johan.budgetmaster.service.AssetService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    private Long getCurrentUserId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
    }

    @GetMapping
    public ResponseEntity<List<AssetDto>> listAssets() {
        return ResponseEntity.ok(assetService.listByUser(getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<AssetDto> createAsset(@RequestBody CreateAssetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assetService.createAsset(getCurrentUserId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/snapshots")
    public ResponseEntity<List<AssetSnapshotDto>> listSnapshots(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.listSnapshots(getCurrentUserId(), id));
    }

    @PostMapping("/{id}/snapshots")
    public ResponseEntity<AssetSnapshotDto> createSnapshot(
            @PathVariable Long id,
            @RequestBody CreateAssetSnapshotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assetService.createSnapshot(getCurrentUserId(), id, request));
    }
}
