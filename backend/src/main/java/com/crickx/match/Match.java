package com.crickx.match;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "matches")
public class Match {

    @Id
    private String id;

    private String createdBy;
    private String creatorName;
    private String locationName;
    private String sport; // New: Dynamic sport name

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    private Instant dateTime;

    @Builder.Default
    private int totalPlayers = 12;

    @Builder.Default
    private List<String> playersJoined = new ArrayList<>();

    @Builder.Default
    private double costPerPlayer = 0;

    @Builder.Default
    private SkillLevel skillLevel = SkillLevel.ANY;

    @Builder.Default
    private MatchType matchType = MatchType.CASUAL;

    @Builder.Default
    private MatchStatus status = MatchStatus.OPEN;

    private String description;

    @Builder.Default
    private boolean isTeamChallenge = false;

    private String teamAName;
    private String teamBName;

    private String teamACode; // For joining Team A
    private String teamBCode; // For joining Team B

    @Builder.Default
    private List<String> teamAPlayers = new ArrayList<>();

    @Builder.Default
    private List<String> teamBPlayers = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    public int getPlayersNeeded() {
        return totalPlayers - playersJoined.size();
    }

    public boolean isFull() {
        return playersJoined.size() >= totalPlayers;
    }

    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, ANY
    }

    public enum MatchType {
        CASUAL, CHALLENGE
    }

    public enum MatchStatus {
        OPEN, FULL, COMPLETED, CANCELLED
    }
}
