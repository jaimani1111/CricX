package com.crickx.challenge.dto;

import com.crickx.challenge.Challenge;
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
public class ChallengeResponse {

    private String id;
    private String createdBy;
    private String sportId;
    private String teamAName;
    private List<String> teamAPlayers;
    private String teamBName;
    private List<String> teamBPlayers;
    private String acceptedBy;
    private String locationName;
    private double longitude;
    private double latitude;
    private Instant dateTime;
    private String format;
    private String status;
    private String description;
    private Double distance;
    private Instant createdAt;

    public static ChallengeResponse from(Challenge c) {
        return ChallengeResponse.builder()
                .id(c.getId())
                .createdBy(c.getCreatedBy())
                .sportId(c.getSportId())
                .teamAName(c.getTeamAName())
                .teamAPlayers(c.getTeamAPlayers())
                .teamBName(c.getTeamBName())
                .teamBPlayers(c.getTeamBPlayers())
                .acceptedBy(c.getAcceptedBy())
                .locationName(c.getLocationName())
                .longitude(c.getLocation() != null ? c.getLocation().getX() : 0)
                .latitude(c.getLocation() != null ? c.getLocation().getY() : 0)
                .dateTime(c.getDateTime())
                .format(c.getFormat().name())
                .status(c.getStatus().name())
                .description(c.getDescription())
                .createdAt(c.getCreatedAt())
                .build();
    }

    public static ChallengeResponse from(Challenge c, double distanceKm) {
        ChallengeResponse r = from(c);
        r.setDistance(Math.round(distanceKm * 10.0) / 10.0);
        return r;
    }
}
