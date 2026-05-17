package com.crickx.esports.chat;

import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/esports/chat")
@RequiredArgsConstructor
public class EsportsMessageController {

    private final EsportsMessageService esportsMessageService;

    @GetMapping("/{matchId}")
    public ResponseEntity<List<EsportsMessage>> getLobbyMessages(
            @PathVariable String matchId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(esportsMessageService.getLobbyMessages(matchId, user.getId()));
    }

    @PostMapping("/{matchId}")
    public ResponseEntity<EsportsMessage> sendMessage(
            @PathVariable String matchId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String content = body != null ? body.get("content") : "";
        return ResponseEntity.ok(esportsMessageService.sendMessage(matchId, user.getId(), content));
    }
}
