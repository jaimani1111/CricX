package com.crickx.tournament;

import com.crickx.auth.JwtTokenProvider;
import com.crickx.tournament.dto.TournamentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping
    public ResponseEntity<Tournament> createTournament(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody TournamentRequest request) {
        String adminId = tokenProvider.getUserIdFromToken(token.substring(7));
        return ResponseEntity.ok(tournamentService.createTournament(request, adminId));
    }

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Tournament>> getNearbyTournaments(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "50") double radius) {
        return ResponseEntity.ok(tournamentService.getNearbyTournaments(lng, lat, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> getTournament(@PathVariable String id) {
        return ResponseEntity.ok(tournamentService.getTournament(id));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Tournament> joinTournament(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        String playerId = tokenProvider.getUserIdFromToken(token.substring(7));
        return ResponseEntity.ok(tournamentService.joinTournament(id, playerId));
    }
}
