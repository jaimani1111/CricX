package com.crickx.esports.tournament;

import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/esports/tournaments")
@RequiredArgsConstructor
public class EsportsTournamentController {

    private final EsportsTournamentService esportsTournamentService;

    @PostMapping
    public ResponseEntity<EsportsTournament> createTournament(
            @RequestBody EsportsTournament tournament,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsTournamentService.createTournament(tournament, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<EsportsTournament>> getAllTournaments() {
        return ResponseEntity.ok(esportsTournamentService.getAllTournaments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EsportsTournament> getTournamentById(@PathVariable String id) {
        return ResponseEntity.ok(esportsTournamentService.getTournamentById(id));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<EsportsTournament> registerTeam(
            @PathVariable String id,
            @RequestBody EsportsTournament.EsportsTeam team,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsTournamentService.registerTeam(id, team, user.getId()));
    }
}
