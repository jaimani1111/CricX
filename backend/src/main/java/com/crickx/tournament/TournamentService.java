package com.crickx.tournament;

import com.crickx.tournament.dto.TournamentRequest;
import com.crickx.user.Role;
import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;

    public Tournament createTournament(TournamentRequest request, String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != Role.ADMIN && admin.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Only admins can create tournaments");
        }

        Tournament tournament = Tournament.builder()
                .adminId(admin.getId())
                .adminName(admin.getName())
                .title(request.getTitle())
                .description(request.getDescription())
                .sport(request.getSport())
                .locationName(request.getLocationName())
                .location(new GeoJsonPoint(request.getLongitude(), request.getLatitude()))
                .dateTime(request.getDateTime())
                .entryFee(request.getEntryFee())
                .prizePool(request.getPrizePool())
                .maxTeams(request.getMaxTeams())
                .build();

        return tournamentRepository.save(tournament);
    }

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public Tournament getTournament(String id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
    }

    public Tournament joinTournament(String tournamentId, String playerId) {
        Tournament tournament = getTournament(tournamentId);

        if (tournament.isFull()) {
            throw new RuntimeException("Tournament is full");
        }

        if (tournament.getJoinedPlayers().contains(playerId)) {
            throw new RuntimeException("You have already joined this tournament");
        }

        // TODO: In a real app, process payment (Stripe/Razorpay) before adding player here
        // if (tournament.getEntryFee() > 0) {
        //    processPayment(playerId, tournament.getEntryFee());
        // }

        tournament.getJoinedPlayers().add(playerId);
        
        if (tournament.isFull()) {
            tournament.setStatus(Tournament.TournamentStatus.ONGOING);
        }

        return tournamentRepository.save(tournament);
    }

    public List<Tournament> getNearbyTournaments(double lng, double lat, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        return tournamentRepository.findNearbyOpenTournaments(lng, lat, radiusMeters);
    }
}
