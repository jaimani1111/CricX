package com.crickx.esports.profile;

import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/esports/profiles")
@RequiredArgsConstructor
public class EsportsProfileController {

    private final EsportsProfileService esportsProfileService;

    @GetMapping("/my")
    public ResponseEntity<EsportsProfile> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsProfileService.getProfileByUserId(user.getId()));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<EsportsProfile> getProfileByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(esportsProfileService.getProfileByUserId(userId));
    }

    @PutMapping
    public ResponseEntity<EsportsProfile> saveProfile(
            @RequestBody EsportsProfile profile,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsProfileService.saveProfile(profile, user.getId()));
    }

    @GetMapping
    public ResponseEntity<java.util.List<EsportsProfile>> getAllProfiles() {
        return ResponseEntity.ok(esportsProfileService.getAllProfiles());
    }
}
