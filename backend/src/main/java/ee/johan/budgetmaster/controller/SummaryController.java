package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.NetWorthDto;
import ee.johan.budgetmaster.dto.SummaryDto;
import ee.johan.budgetmaster.service.SummaryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class SummaryController {

    private final SummaryService summaryService;

    private Long getCurrentUserId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString());
    }

    @GetMapping("/summary/{yearMonth}")
    public ResponseEntity<SummaryDto> getSummary(@PathVariable String yearMonth) {
        return ResponseEntity.ok(summaryService.summarize(getCurrentUserId(), yearMonth));
    }

    @GetMapping("/networth")
    public ResponseEntity<List<NetWorthDto>> getNetWorthHistory(
            @RequestParam("from") String from,
            @RequestParam("to") String to) {
        return ResponseEntity.ok(summaryService.getNetWorthHistory(getCurrentUserId(), from, to));
    }
}
