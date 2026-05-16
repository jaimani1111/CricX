package com.crickx.player.dto;

import com.crickx.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerResponse {

    private String id;
    private String name;
    private String email;
    private String skill;
    private double rating;
    private String preferredRole;
    private boolean available;
    private String locationName;
    private Double longitude;
    private Double latitude;
    private Double distance;
    private String phone;

    public static PlayerResponse from(User u, Double distanceKm) {
        return PlayerResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .skill(u.getSkill() != null ? u.getSkill().name() : null)
                .rating(u.getRating())
                .preferredRole(u.getPreferredRole() != null ? u.getPreferredRole().name() : null)
                .available(u.isAvailable())
                .locationName(u.getLocationName())
                .longitude(u.getLocation() != null ? u.getLocation().getX() : null)
                .latitude(u.getLocation() != null ? u.getLocation().getY() : null)
                .distance(distanceKm != null ? Math.round(distanceKm * 10.0) / 10.0 : null)
                .phone(u.getPhone())
                .build();
    }
}
