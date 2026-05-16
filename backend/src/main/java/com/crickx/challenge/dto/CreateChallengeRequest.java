package com.crickx.challenge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateChallengeRequest {

    @NotBlank(message = "Team name is required")
    private String teamName;

    @NotBlank(message = "Sport ID is required")
    private String sportId;

    @NotBlank(message = "Location name is required")
    private String locationName;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotBlank(message = "Date/time is required")
    private String dateTime;

    private String format = "ELEVEN_V_ELEVEN"; // SIX_V_SIX, EIGHT_V_EIGHT, ELEVEN_V_ELEVEN
    private String description;
}
