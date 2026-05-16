package com.crickx.player.dto;

import lombok.Data;

@Data
public class AvailabilityRequest {
    private boolean available;
    private Double longitude;
    private Double latitude;
    private String locationName;
}
