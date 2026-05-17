package com.crickx.esports.tournament;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EsportsTournamentService {

    private final EsportsTournamentRepository esportsTournamentRepository;

    public EsportsTournament createTournament(EsportsTournament tournament, String userId) {
        tournament.setHostId(userId);
        tournament.setCreatedAt(Instant.now());
        if (tournament.getRegisteredTeams() == null) {
            tournament.setRegisteredTeams(new ArrayList<>());
        }
        return esportsTournamentRepository.save(tournament);
    }

    public List<EsportsTournament> getAllTournaments() {
        return esportsTournamentRepository.findAll();
    }

    public EsportsTournament getTournamentById(String id) {
        return esportsTournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
    }

    public EsportsTournament registerTeam(String tournamentId, EsportsTournament.EsportsTeam team, String captainUserId) {
        EsportsTournament tournament = getTournamentById(tournamentId);

        if (tournament.getRegisteredTeams().size() >= tournament.getMaxTeams()) {
            throw new RuntimeException("Tournament is at maximum team capacity");
        }

        // Check if captain already registered a team
        boolean alreadyRegistered = tournament.getRegisteredTeams().stream()
                .anyMatch(t -> t.getCaptainUserId().equals(captainUserId));
        if (alreadyRegistered) {
            throw new RuntimeException("You have already registered a team for this tournament");
        }

        team.setCaptainUserId(captainUserId);
        if (team.getPlayerUserIds() == null) {
            team.setPlayerUserIds(new ArrayList<>());
        }
        if (!team.getPlayerUserIds().contains(captainUserId)) {
            team.getPlayerUserIds().add(captainUserId);
        }

        tournament.getRegisteredTeams().add(team);
        return esportsTournamentRepository.save(tournament);
    }
}
