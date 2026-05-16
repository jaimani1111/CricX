package com.crickx.match;

import com.crickx.match.dto.CreateMatchRequest;
import com.crickx.match.dto.MatchResponse;
import com.crickx.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<MatchResponse> createMatch(
            @Valid @RequestBody CreateMatchRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.createMatch(request, user.getId()));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<MatchResponse>> getNearbyMatches(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double maxCost,
            @RequestParam(required = false) String sport) {
        return ResponseEntity.ok(matchService.findNearbyMatches(lng, lat, radius, skill, type, maxCost, sport));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatch(@PathVariable String id) {
        return ResponseEntity.ok(matchService.getMatch(id));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<MatchResponse> joinMatch(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.joinMatch(id, user.getId()));
    }

    @PostMapping("/{id}/join-team")
    public ResponseEntity<MatchResponse> joinTeam(
            @PathVariable String id,
            @RequestParam String code,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.joinTeamByCode(id, code, user.getId()));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<MatchResponse> leaveMatch(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.leaveMatch(id, user.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MatchResponse>> getMyMatches(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.getMyMatches(user.getId()));
    }
}
