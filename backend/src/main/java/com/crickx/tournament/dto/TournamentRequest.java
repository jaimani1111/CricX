package com.crickx.tournament.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class TournamentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Sport is required")
    private String sport;

    @NotBlank(message = "Location name is required")
    private String locationName;

    private double longitude;
    private double latitude;

    @NotNull(message = "Date Time is required")
    private Instant dateTime;

    private double entryFee;
    private double prizePool;
    private int maxTeams = 8;
}
