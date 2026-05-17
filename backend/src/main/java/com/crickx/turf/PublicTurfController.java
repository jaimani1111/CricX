package com.crickx.turf;

import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turfs")
@RequiredArgsConstructor
public class PublicTurfController {

    private final TurfService turfService;

    @GetMapping("/nearby")
    public ResponseEntity<List<Turf>> getNearbyTurfs(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "15") double radius) {
        return ResponseEntity.ok(turfService.findNearby(lng, lat, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Turf> getTurf(@PathVariable String id) {
        return ResponseEntity.ok(turfService.getTurfById(id));
    }

    @GetMapping
    public ResponseEntity<List<Turf>> getAllTurfs() {
        return ResponseEntity.ok(turfService.getAllTurfs());
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<Turf> bookSlot(
            @PathVariable String id,
            @RequestBody Turf.BlockedSlot slot,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(turfService.bookPlayerSlot(id, slot, user));
    }
}
