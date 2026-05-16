package com.crickx.match.dto;

import com.crickx.match.Match;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {

    private String id;
    private String createdBy;
    private String creatorName;
    private String locationName;
    private double longitude;
    private double latitude;
    private Instant dateTime;
    private int totalPlayers;
    private int playersJoinedCount;
    private int playersNeeded;
    private List<String> playersJoined;
    private double costPerPlayer;
    private String skillLevel;
    private String matchType;
    private String status;
    private String description;
    private String sport;
    private boolean isTeamChallenge;
    private String teamAName;
    private String teamBName;
    private String teamACode;
    private String teamBCode;
    private List<String> teamAPlayers;
    private List<String> teamBPlayers;
    private Double distance; // distance in km from query point
    private Instant createdAt;

    public static MatchResponse from(Match match) {
        return MatchResponse.builder()
                .id(match.getId())
                .createdBy(match.getCreatedBy())
                .creatorName(match.getCreatorName())
                .locationName(match.getLocationName())
                .longitude(match.getLocation() != null ? match.getLocation().getX() : 0)
                .latitude(match.getLocation() != null ? match.getLocation().getY() : 0)
                .dateTime(match.getDateTime())
                .totalPlayers(match.getTotalPlayers())
                .playersJoinedCount(match.getPlayersJoined().size())
                .playersNeeded(match.getPlayersNeeded())
                .playersJoined(match.getPlayersJoined())
                .costPerPlayer(match.getCostPerPlayer())
                .skillLevel(match.getSkillLevel().name())
                .matchType(match.getMatchType().name())
                .status(match.getStatus().name())
                .description(match.getDescription())
                .sport(match.getSport())
                .isTeamChallenge(match.isTeamChallenge())
                .teamAName(match.getTeamAName())
                .teamBName(match.getTeamBName())
                .teamACode(match.getTeamACode())
                .teamBCode(match.getTeamBCode())
                .teamAPlayers(match.getTeamAPlayers())
                .teamBPlayers(match.getTeamBPlayers())
                .createdAt(match.getCreatedAt())
                .build();
    }

    public static MatchResponse from(Match match, double distanceKm) {
        MatchResponse response = from(match);
        response.setDistance(Math.round(distanceKm * 10.0) / 10.0);
        return response;
    }
}
