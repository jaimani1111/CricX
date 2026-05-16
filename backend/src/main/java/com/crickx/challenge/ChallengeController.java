package com.crickx.challenge;

import com.crickx.challenge.dto.ChallengeResponse;
import com.crickx.challenge.dto.CreateChallengeRequest;
import com.crickx.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @PostMapping
    public ResponseEntity<ChallengeResponse> createChallenge(
            @Valid @RequestBody CreateChallengeRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.createChallenge(request, user.getId()));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ChallengeResponse>> getNearbyChallenges(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "10") double radius) {
        return ResponseEntity.ok(challengeService.findNearbyChallenges(lng, lat, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResponse> getChallenge(@PathVariable String id) {
        return ResponseEntity.ok(challengeService.getChallenge(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ChallengeResponse> acceptChallenge(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, String> body) {
        String teamName = body != null ? body.get("teamName") : null;
        return ResponseEntity.ok(challengeService.acceptChallenge(id, user.getId(), teamName));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ChallengeResponse>> getMyChallenges(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(challengeService.getMyChallenges(user.getId()));
    }
}
