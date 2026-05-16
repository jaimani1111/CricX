package com.crickx.match;

import com.crickx.match.dto.CreateMatchRequest;
import com.crickx.match.dto.MatchResponse;
import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MatchResponse createMatch(CreateMatchRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Match match = Match.builder()
                .createdBy(userId)
                .creatorName(user.getName())
                .locationName(request.getLocationName())
                .location(new GeoJsonPoint(request.getLongitude(), request.getLatitude()))
                .dateTime(Instant.parse(request.getDateTime()))
                .totalPlayers(request.getTotalPlayers())
                .costPerPlayer(request.getCostPerPlayer())
                .skillLevel(parseSkillLevel(request.getSkillLevel()))
                .matchType(parseMatchType(request.getMatchType()))
                .description(request.getDescription())
                .sport(request.getSport())
                .isTeamChallenge(request.isTeamChallenge())
                .build();

        if (request.isTeamChallenge()) {
            match.setTeamAName(request.getTeamAName());
            match.setTeamBName(request.getTeamBName());
            match.setTeamACode(generateTeamCode());
            match.setTeamBCode(generateTeamCode());
            
            // Creator auto-joins Team A
            match.getTeamAPlayers().add(userId);
            match.getPlayersJoined().add(userId);
        } else {
            // Creator auto-joins casual match
            match.getPlayersJoined().add(userId);
        }

        match = matchRepository.save(match);
        return MatchResponse.from(match);
    }

    private String generateTeamCode() {
        return String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
    }

    public MatchResponse joinTeamByCode(String matchId, String code, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getPlayersJoined().contains(userId)) {
            throw new RuntimeException("Already joined this match");
        }

        int teamLimit = match.getTotalPlayers() / 2;

        if (code.equals(match.getTeamACode())) {
            if (match.getTeamAPlayers().size() >= teamLimit) {
                throw new RuntimeException("Team A is full");
            }
            match.getTeamAPlayers().add(userId);
        } else if (code.equals(match.getTeamBCode())) {
            if (match.getTeamBPlayers().size() >= teamLimit) {
                throw new RuntimeException("Team B is full");
            }
            match.getTeamBPlayers().add(userId);
        } else {
            throw new RuntimeException("Invalid team code");
        }

        match.getPlayersJoined().add(userId);
        if (match.isFull()) {
            match.setStatus(Match.MatchStatus.FULL);
        }

        match = matchRepository.save(match);
        MatchResponse response = MatchResponse.from(match);
        
        // Broadcast
        messagingTemplate.convertAndSend("/topic/match/" + matchId,
                Map.of("event", "MATCH_JOINED", "match", response, "userId", userId));
                
        return response;
    }

    public List<MatchResponse> findNearbyMatches(double lng, double lat, double radiusKm,
                                                  String skill, String type, Double maxCost, String sport) {
        double radiusMeters = radiusKm * 1000;
        List<Match> matches;

        boolean hasSport = sport != null && !sport.equalsIgnoreCase("all");
        boolean hasSkill = skill != null && !skill.equalsIgnoreCase("ANY");
        boolean hasType = type != null && !type.equalsIgnoreCase("CASUAL"); // or whatever logic

        if (hasSport) {
            if (hasSkill && hasType) {
                matches = matchRepository.findNearbyOpenMatchesBySportSkillAndType(lng, lat, radiusMeters, sport, skill, type);
            } else if (hasSkill) {
                matches = matchRepository.findNearbyOpenMatchesBySportAndSkill(lng, lat, radiusMeters, sport, skill);
            } else if (hasType) {
                matches = matchRepository.findNearbyOpenMatchesBySportAndType(lng, lat, radiusMeters, sport, type);
            } else {
                matches = matchRepository.findNearbyOpenMatchesBySport(lng, lat, radiusMeters, sport);
            }
        } else {
            if (hasSkill && hasType) {
                matches = matchRepository.findNearbyOpenMatchesBySkillAndType(lng, lat, radiusMeters, skill, type);
            } else if (hasSkill) {
                matches = matchRepository.findNearbyOpenMatchesBySkill(lng, lat, radiusMeters, skill);
            } else if (hasType) {
                matches = matchRepository.findNearbyOpenMatchesByType(lng, lat, radiusMeters, type);
            } else {
                matches = matchRepository.findNearbyOpenMatches(lng, lat, radiusMeters);
            }
        }

        return matches.stream()
                .filter(m -> maxCost == null || m.getCostPerPlayer() <= maxCost)
                .map(m -> {
                    double dist = calculateDistance(lat, lng,
                            m.getLocation().getY(), m.getLocation().getX());
                    return MatchResponse.from(m, dist);
                })
                .collect(Collectors.toList());
    }

    public MatchResponse getMatch(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        return MatchResponse.from(match);
    }

    public MatchResponse joinMatch(String matchId, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.isTeamChallenge()) {
            throw new RuntimeException("Team challenges require a team code to join");
        }

        if (match.getPlayersJoined().contains(userId)) {
            throw new RuntimeException("Already joined this match");
        }

        if (match.isFull()) {
            throw new RuntimeException("Match is full");
        }

        if (match.getStatus() != Match.MatchStatus.OPEN) {
            throw new RuntimeException("Match is not open for joining");
        }

        match.getPlayersJoined().add(userId);

        if (match.isFull()) {
            match.setStatus(Match.MatchStatus.FULL);
        }

        match = matchRepository.save(match);
        MatchResponse response = MatchResponse.from(match);

        // Broadcast real-time update
        messagingTemplate.convertAndSend("/topic/match/" + matchId,
                Map.of("event", "MATCH_JOINED", "match", response, "userId", userId));

        return response;
    }

    public MatchResponse leaveMatch(String matchId, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!match.getPlayersJoined().contains(userId)) {
            throw new RuntimeException("Not part of this match");
        }

        if (match.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Creator cannot leave the match. Cancel it instead.");
        }

        match.getPlayersJoined().remove(userId);
        if (match.isTeamChallenge()) {
            match.getTeamAPlayers().remove(userId);
            match.getTeamBPlayers().remove(userId);
        }

        if (match.getStatus() == Match.MatchStatus.FULL) {
            match.setStatus(Match.MatchStatus.OPEN);
        }

        match = matchRepository.save(match);
        MatchResponse response = MatchResponse.from(match);

        // Broadcast real-time update
        messagingTemplate.convertAndSend("/topic/match/" + matchId,
                Map.of("event", "MATCH_LEFT", "match", response, "userId", userId));

        return response;
    }

    public List<MatchResponse> getMyMatches(String userId) {
        List<Match> created = matchRepository.findByCreatedBy(userId);
        List<Match> joined = matchRepository.findByPlayerJoined(userId);

        Set<String> ids = new HashSet<>();
        List<Match> all = new ArrayList<>();
        for (Match m : created) { if (ids.add(m.getId())) all.add(m); }
        for (Match m : joined) { if (ids.add(m.getId())) all.add(m); }

        return all.stream().map(MatchResponse::from).collect(Collectors.toList());
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

    private Match.SkillLevel parseSkillLevel(String skill) {
        if (skill == null) return Match.SkillLevel.ANY;
        try { return Match.SkillLevel.valueOf(skill.toUpperCase()); }
        catch (Exception e) { return Match.SkillLevel.ANY; }
    }

    private Match.MatchType parseMatchType(String type) {
        if (type == null) return Match.MatchType.CASUAL;
        try { return Match.MatchType.valueOf(type.toUpperCase()); }
        catch (Exception e) { return Match.MatchType.CASUAL; }
    }
}
