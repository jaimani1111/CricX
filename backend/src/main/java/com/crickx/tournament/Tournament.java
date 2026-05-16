package com.crickx.tournament;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tournaments")
public class Tournament {

    @Id
    private String id;

    private String adminId;
    private String adminName;

    private String title;
    private String description;
    private String sport;
    private String locationName;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO2DSPHERE)
    private GeoJsonPoint location;
    
    private Instant dateTime;
    
    @Builder.Default
    private double entryFee = 0;
    
    @Builder.Default
    private double prizePool = 0;

    @Builder.Default
    private int maxTeams = 8;

    @Builder.Default
    private List<String> joinedPlayers = new ArrayList<>();

    @Builder.Default
    private TournamentStatus status = TournamentStatus.OPEN;

    @CreatedDate
    private Instant createdAt;

    public boolean isFull() {
        return joinedPlayers.size() >= maxTeams; // Using maxTeams as player count for individual signups for simplicity
    }

    public enum TournamentStatus {
        OPEN, ONGOING, COMPLETED, CANCELLED
    }
}
