package com.crickx.player;

import com.crickx.player.dto.AvailabilityRequest;
import com.crickx.player.dto.PlayerResponse;
import com.crickx.user.User;
import com.crickx.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final UserService userService;

    @GetMapping("/nearby")
    public ResponseEntity<List<PlayerResponse>> getNearbyPlayers(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam(defaultValue = "10") double radius) {

        List<User> players = userService.findNearbyAvailablePlayers(lng, lat, radius);

        List<PlayerResponse> response = players.stream()
                .map(u -> {
                    double dist = calculateDistance(lat, lng,
                            u.getLocation().getY(), u.getLocation().getX());
                    return PlayerResponse.from(u, dist);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/availability")
    public ResponseEntity<PlayerResponse> setAvailability(
            @Valid @RequestBody AvailabilityRequest request,
            @AuthenticationPrincipal User user) {
        User updated = userService.toggleAvailability(
                user.getId(), request.isAvailable(),
                request.getLongitude(), request.getLatitude(),
                request.getLocationName());
        return ResponseEntity.ok(PlayerResponse.from(updated, null));
    }

    @GetMapping("/me")
    public ResponseEntity<PlayerResponse> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(PlayerResponse.from(user, null));
    }

    @PutMapping("/me")
    public ResponseEntity<PlayerResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody java.util.Map<String, String> body) {
        User.SkillLevel skill = body.containsKey("skill") ?
                User.SkillLevel.valueOf(body.get("skill").toUpperCase()) : null;
        User.PreferredRole role = body.containsKey("preferredRole") ?
                User.PreferredRole.valueOf(body.get("preferredRole").toUpperCase()) : null;

        User updated = userService.updateProfile(
                user.getId(), body.get("name"), skill, role, body.get("phone"));
        return ResponseEntity.ok(PlayerResponse.from(updated, null));
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
