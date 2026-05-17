package com.crickx.turf;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "turfs")
public class Turf {
    @Id
    private String id;
    
    private String ownerId; // Link to USER with Role ADMIN
    private String name;
    private String address;
    
    // Location Hierarchy (Zomato-style)
    private String district;
    private String city;
    private String state;
    private String pincode;
    
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
    
    private String description;
    private String phone;
    private String website;
    private List<String> photos; // URLs
    
    private List<String> availableSports; // Sport names
    private List<String> facilities; // e.g. ["Floodlights", "Parking", "Washroom", "Cafeteria"]
    
    private double basePricePerHour;
    
    private String openingTime; // HH:mm
    private String closingTime; // HH:mm
    private List<String> daysOpen; // ["MON", "TUE", ...]
    
    private String pitchType; // GRASS, TURF, BOX, CEMENT
    private int courtCount;
    
    private boolean isVerified;
    private boolean isActive;
    
    private List<BlockedSlot> manuallyBlockedSlots;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class BlockedSlot {
        private String date; // YYYY-MM-DD
        private String startTime; // HH:mm
        private String endTime; // HH:mm
        private String reason;
        private String bookedByUserId;
        private String bookedByUserName;
        private String bookedByUserPhone;
        private String status; // PENDING, APPROVED, CANCELLED
    }
}
