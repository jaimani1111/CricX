package com.crickx.esports.match;

import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/esports/matches")
@RequiredArgsConstructor
public class EsportsMatchController {

    private final EsportsMatchService esportsMatchService;

    @PostMapping
    public ResponseEntity<EsportsMatch> createMatch(
            @RequestBody EsportsMatch match,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsMatchService.createMatch(match, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<EsportsMatch>> getAllMatches() {
        return ResponseEntity.ok(esportsMatchService.getAllMatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EsportsMatch> getMatchById(@PathVariable String id) {
        return ResponseEntity.ok(esportsMatchService.getMatchById(id));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<EsportsMatch> joinMatch(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsMatchService.joinMatch(id, user.getId()));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<EsportsMatch> leaveMatch(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsMatchService.leaveMatch(id, user.getId()));
    }
}
