package com.crickx.esports.tournament;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "esports_tournaments")
public class EsportsTournament {

    @Id
    private String id;

    private String title;
    private String gameName;
    private String description;
    private String rules;
    
    private Instant startTime;
    private int maxTeams;
    private int playersPerTeam;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private String hostId;

    @Builder.Default
    private List<EsportsTeam> registeredTeams = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EsportsTeam {
        private String teamName;
        private String captainUserId;
        
        @Builder.Default
        private List<String> playerUserIds = new ArrayList<>();
    }
}
