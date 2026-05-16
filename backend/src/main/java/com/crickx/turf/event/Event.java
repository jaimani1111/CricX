package com.crickx.turf.event;

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
@Document(collection = "events")
public class Event {
    @Id
    private String id;
    
    private String turfId; // Optional link to a registered venue
    private String ownerId; // Admin who created it
    
    private String title;
    private String description;
    private EventCategory category;
    
    private Instant dateTime;
    private Instant endDateTime;
    
    private String address; // Manual address if not linked to turfId
    
    private double ticketPrice;
    private int totalTickets;
    
    @Builder.Default
    private List<String> registeredUserIds = new ArrayList<>();
    
    private EventStatus status;
    private String bannerImageUrl;
    private List<String> tags;

    // ── Match Configuration ──
    private String matchFormat;       // T10, T20, ODI, Test, Custom
    private Integer overs;            // Number of overs (null for non-cricket)
    private Integer maxTeams;         // For tournament brackets
    private Integer playersPerTeam;

    // ── Officials & Production ──
    private boolean hasUmpires;
    private int umpireCount;
    private boolean hasScorer;
    private boolean hasDrinkBreaks;
    private int drinkBreakIntervalOvers; // e.g. every 10 overs
    private boolean hasLunchBreak;
    private boolean hasLiveTelecast;
    private String liveTelecastUrl;
    private String streamingPlatform;  // YouTube, Hotstar, Facebook, etc.
    private boolean hasCommentary;

    // ── Venue & Logistics ──
    private String pitchType;          // Turf, Grass, Cement, Mat
    private boolean floodlightsAvailable;
    private boolean parkingAvailable;
    private boolean changingRoomAvailable;
    private String foodAndBeverages;   // e.g. "Complimentary water & snacks"

    // ── Prizes & Rules ──
    private String prizes;             // e.g. "₹50,000 Winner / ₹25,000 Runner-up"
    private String manOfTheMatchPrize;
    private String rules;              // Tournament rules / match rules
    private String entryRequirements;  // e.g. "Age 16+, bring own gear"
    private String dresscode;

    // ── Flexible Custom Fields ──
    @Builder.Default
    private Map<String, String> customFields = new HashMap<>();

    public enum EventCategory {
        T10_MATCH, T20_MATCH, ODI_MATCH, TEST_MATCH,
        TOURNAMENT, LEAGUE, KNOCKOUT,
        STADIUM_EVENT, CHEERLEADER_SHOW, TRAINING_CAMP,
        COACHING_CLINIC, KIDS_CAMP, CORPORATE_EVENT,
        OTHER
    }

    public enum EventStatus {
        UPCOMING, ONGOING, COMPLETED, CANCELLED
    }
}
