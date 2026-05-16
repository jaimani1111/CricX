package com.crickx.auth.dto;

import com.crickx.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String username;
    private String email;
    private String role;
    private String skill;
    private String preferredRole;
    private double rating;

    public static AuthResponse from(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "PLAYER")
                .skill(user.getSkill() != null ? user.getSkill().name() : null)
                .preferredRole(user.getPreferredRole() != null ? user.getPreferredRole().name() : null)
                .rating(user.getRating())
                .build();
    }
}
