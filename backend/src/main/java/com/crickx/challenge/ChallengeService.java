package com.crickx.challenge;

import com.crickx.challenge.dto.ChallengeResponse;
import com.crickx.challenge.dto.CreateChallengeRequest;
import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChallengeResponse createChallenge(CreateChallengeRequest request, String userId) {
        Challenge challenge = Challenge.builder()
                .createdBy(userId)
                .sportId(request.getSportId())
                .teamAName(request.getTeamName())
                .locationName(request.getLocationName())
                .location(new GeoJsonPoint(request.getLongitude(), request.getLatitude()))
                .dateTime(Instant.parse(request.getDateTime()))
                .endTime(Instant.parse(request.getDateTime()).plusSeconds(3600 * 3)) // default 3 hrs
                .format(parseFormat(request.getFormat()))
                .description(request.getDescription())
                .build();

        challenge.getTeamAPlayers().add(userId);
        challenge = challengeRepository.save(challenge);

        return ChallengeResponse.from(challenge);
    }

    public List<ChallengeResponse> findNearbyChallenges(double lng, double lat, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        List<Challenge> challenges = challengeRepository.findNearbyOpenChallenges(lng, lat, radiusMeters);

        return challenges.stream()
                .filter(c -> c.getEndTime() == null || c.getEndTime().isAfter(Instant.now()))
                .map(c -> {
                    double dist = calculateDistance(lat, lng,
                            c.getLocation().getY(), c.getLocation().getX());
                    return ChallengeResponse.from(c, dist);
                })
                .collect(Collectors.toList());
    }

    public ChallengeResponse acceptChallenge(String challengeId, String userId, String teamName) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (challenge.getStatus() != Challenge.ChallengeStatus.OPEN) {
            throw new RuntimeException("Challenge is not open");
        }

        if (challenge.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Cannot accept your own challenge");
        }

        challenge.setAcceptedBy(userId);
        challenge.setTeamBName(teamName != null ? teamName : "Team B");
        challenge.getTeamBPlayers().add(userId);
        challenge.setStatus(Challenge.ChallengeStatus.ACCEPTED);

        challenge = challengeRepository.save(challenge);
        ChallengeResponse response = ChallengeResponse.from(challenge);

        // Broadcast
        messagingTemplate.convertAndSend("/topic/challenges",
                Map.of("event", "CHALLENGE_ACCEPTED", "challenge", response));

        return response;
    }

    public ChallengeResponse getChallenge(String id) {
        Challenge c = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        return ChallengeResponse.from(c);
    }

    public List<ChallengeResponse> getMyChallenges(String userId) {
        return challengeRepository.findByParticipant(userId).stream()
                .map(ChallengeResponse::from)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private Challenge.ChallengeFormat parseFormat(String format) {
        if (format == null) return Challenge.ChallengeFormat.ELEVEN_V_ELEVEN;
        try { return Challenge.ChallengeFormat.valueOf(format.toUpperCase()); }
        catch (Exception e) { return Challenge.ChallengeFormat.ELEVEN_V_ELEVEN; }
    }
}
