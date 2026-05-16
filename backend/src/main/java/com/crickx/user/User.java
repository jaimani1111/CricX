package com.crickx.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;

    @Builder.Default
    private Role role = Role.PLAYER;

    // Auth & Status
    private String otpCode;
    private LocalDateTime otpExpiry;

    @Builder.Default
    private boolean isEmailVerified = false;

    @Builder.Default
    private boolean isBlocked = false;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    private String locationName;

    @Builder.Default
    private SkillLevel skill = SkillLevel.INTERMEDIATE;

    @Builder.Default
    private double rating = 0.0;

    private PreferredRole preferredRole;

    @Builder.Default
    private boolean available = false;

    private String phone;

    @CreatedDate
    private Instant createdAt;

    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public enum PreferredRole {
        BATSMAN, BOWLER, ALL_ROUNDER, WICKET_KEEPER
    }
}
