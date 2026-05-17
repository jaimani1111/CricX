package com.crickx.esports.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "esports_profiles")
public class EsportsProfile {

    @Id
    private String id; // Matches User ID for 1-to-1 mapping

    private String gamerTag;
    
    @Builder.Default
    private List<String> preferredGames = new ArrayList<>();
    
    private String role; // e.g. SNIPER, RUSHER, SUPPORT, ENTRY, FLEX
    private String skillLevel; // e.g. BEGINNER, INTERMEDIATE, ADVANCED, PRO
    private String rankTier; // e.g. Gold, Platinum, Diamond, Immortal, Conqueror
    
    @Builder.Default
    private Map<String, String> customStats = new HashMap<>(); // dynamic per-game stats (e.g. "K/D" -> "2.3", "Win Rate" -> "68%")
    
    private String screenshotProof; // image verification proof URL
    private String bio;
    
    private String discordUsername;
    private String socialLinks;
    
    private Instant updatedAt;
}
