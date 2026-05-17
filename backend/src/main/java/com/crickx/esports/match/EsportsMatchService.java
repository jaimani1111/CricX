package com.crickx.esports.match;

import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EsportsMatchService {

    private final EsportsMatchRepository esportsMatchRepository;
    private final UserRepository userRepository;

    public EsportsMatch createMatch(EsportsMatch match, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        match.setHostId(userId);
        match.setHostName(user.getName());
        
        if (match.getJoinedUserIds() == null) {
            match.setJoinedUserIds(new ArrayList<>());
        }
        
        // Host automatically joins the lobby
        if (!match.getJoinedUserIds().contains(userId)) {
            match.getJoinedUserIds().add(userId);
        }
        
        match.setCreatedAt(Instant.now());
        return esportsMatchRepository.save(match);
    }

    public List<EsportsMatch> getAllMatches() {
        return esportsMatchRepository.findAll();
    }

    public EsportsMatch getMatchById(String id) {
        return esportsMatchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Esports Match not found"));
    }

    public EsportsMatch joinMatch(String id, String userId) {
        EsportsMatch match = getMatchById(id);
        
        if (match.getJoinedUserIds().contains(userId)) {
            return match; // Already joined
        }
        
        if (match.getJoinedUserIds().size() >= match.getMaxSlots()) {
            throw new RuntimeException("Match lobby is full");
        }
        
        match.getJoinedUserIds().add(userId);
        return esportsMatchRepository.save(match);
    }

    public EsportsMatch leaveMatch(String id, String userId) {
        EsportsMatch match = getMatchById(id);
        
        match.getJoinedUserIds().remove(userId);
        
        // If the lobby becomes empty or host leaves, we can keep it or delete it.
        // Let's keep it but allow other players to remain in the lobby.
        return esportsMatchRepository.save(match);
    }
}
