package com.crickx.match.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMatchRequest {

    @NotBlank(message = "Location name is required")
    private String locationName;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotBlank(message = "Date/time is required")
    private String dateTime;

    @Min(value = 2, message = "At least 2 players required")
    private int totalPlayers = 12;

    @Min(value = 0, message = "Cost cannot be negative")
    private double costPerPlayer = 0;

    private String skillLevel = "ANY";
    private String matchType = "CASUAL";
    private String description;
    
    @NotBlank(message = "Sport is required")
    private String sport;
    
    private boolean isTeamChallenge = false;
    private String teamAName;
    private String teamBName;
}
