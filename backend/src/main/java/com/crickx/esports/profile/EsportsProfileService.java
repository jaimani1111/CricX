package com.crickx.esports.profile;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class EsportsProfileService {

    private final EsportsProfileRepository esportsProfileRepository;

    public EsportsProfile getProfileByUserId(String userId) {
        return esportsProfileRepository.findById(userId)
                .orElseGet(() -> EsportsProfile.builder()
                        .id(userId)
                        .preferredGames(new ArrayList<>())
                        .customStats(new HashMap<>())
                        .gamerTag("Player_" + userId.substring(Math.max(0, userId.length() - 4)))
                        .skillLevel("INTERMEDIATE")
                        .build());
    }

    public EsportsProfile saveProfile(EsportsProfile profile, String userId) {
        profile.setId(userId); // enforce 1-to-1 constraint
        profile.setUpdatedAt(Instant.now());
        return esportsProfileRepository.save(profile);
    }

    public java.util.List<EsportsProfile> getAllProfiles() {
        return esportsProfileRepository.findAll();
    }
}
