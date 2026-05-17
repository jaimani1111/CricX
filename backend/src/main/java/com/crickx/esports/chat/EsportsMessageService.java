package com.crickx.esports.chat;

import com.crickx.esports.match.EsportsMatch;
import com.crickx.esports.match.EsportsMatchRepository;
import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EsportsMessageService {

    private final EsportsMessageRepository esportsMessageRepository;
    private final EsportsMatchRepository esportsMatchRepository;
    private final UserRepository userRepository;

    public EsportsMessage sendMessage(String matchId, String senderId, String content) {
        EsportsMatch match = esportsMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!match.getJoinedUserIds().contains(senderId)) {
            throw new RuntimeException("Access Denied: You must join the match lobby to send messages");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        EsportsMessage msg = EsportsMessage.builder()
                .matchId(matchId)
                .senderId(senderId)
                .senderName(sender.getName())
                .content(content)
                .timestamp(Instant.now())
                .isSystem(false)
                .build();

        return esportsMessageRepository.save(msg);
    }

    public List<EsportsMessage> getLobbyMessages(String matchId, String userId) {
        EsportsMatch match = esportsMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!match.getJoinedUserIds().contains(userId)) {
            throw new RuntimeException("Access Denied: You must join the match lobby to view chat history");
        }

        return esportsMessageRepository.findByMatchIdOrderByTimestampAsc(matchId);
    }
}
