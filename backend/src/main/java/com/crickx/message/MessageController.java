package com.crickx.message;

import com.crickx.auth.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Send a message to another user.
     * POST /api/messages/send
     * Body: { "receiverId": "...", "content": "..." }
     */
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {

        String senderId = extractUserId(authHeader);
        String receiverId = payload.get("receiverId");
        String content = payload.get("content");

        if (receiverId == null || content == null || content.isBlank()) {
            throw new RuntimeException("receiverId and content are required");
        }

        return ResponseEntity.ok(messageService.sendMessage(senderId, receiverId, content));
    }

    /**
     * Get conversation with a specific user.
     * GET /api/messages/conversation/{otherUserId}
     */
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<Message>> getConversation(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String otherUserId) {

        String userId = extractUserId(authHeader);
        return ResponseEntity.ok(messageService.getConversation(userId, otherUserId));
    }

    /**
     * Get group conversation.
     * GET /api/messages/group/{groupId}
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Message>> getGroupConversation(
            @PathVariable String groupId) {
        return ResponseEntity.ok(messageService.getGroupConversation(groupId));
    }

    /**
     * Get inbox (list of all conversations with latest message).
     * GET /api/messages/inbox
     */
    @GetMapping("/inbox")
    public ResponseEntity<List<Map<String, Object>>> getInbox(
            @RequestHeader("Authorization") String authHeader) {

        String userId = extractUserId(authHeader);
        return ResponseEntity.ok(messageService.getInbox(userId));
    }

    /**
     * Get unread message count.
     * GET /api/messages/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String authHeader) {

        String userId = extractUserId(authHeader);
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(userId)));
    }

    private String extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
