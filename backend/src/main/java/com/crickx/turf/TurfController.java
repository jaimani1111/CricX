package com.crickx.turf;

import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/turfs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class TurfController {

    private final TurfService turfService;

    @PostMapping
    public ResponseEntity<Turf> createTurf(@RequestBody Turf turf, @AuthenticationPrincipal User user) {
        turf.setOwnerId(user.getId());
        return ResponseEntity.ok(turfService.createTurf(turf));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Turf>> getMyTurfs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(turfService.getOwnerTurfs(user.getId()));
    }

    @PostMapping("/{turfId}/block")
    public ResponseEntity<Turf> blockSlot(@PathVariable String turfId, @RequestBody Turf.BlockedSlot slot) {
        return ResponseEntity.ok(turfService.blockSlot(turfId, slot));
    }

    @PutMapping("/{turfId}")
    public ResponseEntity<Turf> updateTurf(@PathVariable String turfId, @RequestBody Turf turf) {
        return ResponseEntity.ok(turfService.updateTurf(turfId, turf));
    }
    
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<Turf>> getAllTurfs() {
        return ResponseEntity.ok(turfService.getAllTurfs());
    }
}
