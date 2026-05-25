package com.crickx.challenge;

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
@Document(collection = "challenges")
public class Challenge {

    @Id
    private String id;

    @Builder.Default
    private String sportId = "cricket";

    private String createdBy;

    // Team A (challenger)
    private String teamAName;
    @Builder.Default
    private List<String> teamAPlayers = new ArrayList<>();

    // Team B (acceptor)
    private String teamBName;
    @Builder.Default
    private List<String> teamBPlayers = new ArrayList<>();

    private String acceptedBy;

    private String locationName;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    private Instant dateTime;
    private Instant endTime;

    @Builder.Default
    private ChallengeFormat format = ChallengeFormat.ELEVEN_V_ELEVEN;

    @Builder.Default
    private ChallengeStatus status = ChallengeStatus.OPEN;

    private String description;

    @CreatedDate
    private Instant createdAt;

    public enum ChallengeFormat {
        SIX_V_SIX, EIGHT_V_EIGHT, ELEVEN_V_ELEVEN
    }

    public enum ChallengeStatus {
        OPEN, ACCEPTED, COMPLETED, CANCELLED
    }
}
