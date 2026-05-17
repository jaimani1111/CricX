package com.crickx.esports.match;

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
@Document(collection = "esports_matches")
public class EsportsMatch {

    @Id
    private String id;

    private String gameName;
    private String gameIcon;
    private String title;
    private String type; // e.g. CASUAL, COMPETITIVE, TOURNAMENT
    private String mode; // e.g. 1v1, 2v2, 4v4, SQUAD, CUSTOM, ANY
    
    private int maxSlots;
    private String skillLevel; // e.g. BEGINNER, INTERMEDIATE, ADVANCED, PRO
    private Instant startTime;
    private String region;
    
    private String voiceCommPlatform; // e.g. DISCORD, WHATSAPP, TELEGRAM, IN_APP_CHAT, CUSTOM
    private String voiceCommLink;
    private String streamLink;
    
    private String description;
    private String rules;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private String hostId;
    private String hostName;

    @Builder.Default
    private List<String> joinedUserIds = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;
}
