package com.crickx.message;

import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Message sendMessage(String senderId, String receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        String conversationId;
        String receiverName;

        if (receiverId.startsWith("group_")) {
            conversationId = receiverId;
            receiverName = "Group Chat";
        } else {
            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            conversationId = Message.buildConversationId(senderId, receiverId);
            receiverName = receiver.getName();
        }

        Message message = Message.builder()
                .senderId(senderId)
                .senderName(sender.getName())
                .receiverId(receiverId)
                .receiverName(receiverName)
                .content(content)
                .read(false)
                .conversationId(conversationId)
                .createdAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    public List<Message> getConversation(String userId1, String userId2) {
        String conversationId = Message.buildConversationId(userId1, userId2);
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark unread messages as read for the current user
        messages.stream()
                .filter(m -> m.getReceiverId().equals(userId1) && !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    messageRepository.save(m);
                });

        return messages;
    }

    public List<Message> getGroupConversation(String groupId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(groupId);
    }

    /**
     * Get the inbox: list of conversations with the latest message and user info.
     */
    public List<Map<String, Object>> getInbox(String userId) {
        List<Message> allMessages = messageRepository
                .findBySenderIdOrReceiverIdOrderByCreatedAtDesc(userId, userId);

        // Group by conversationId, pick the latest message per conversation
        Map<String, Message> latestByConversation = new LinkedHashMap<>();
        for (Message m : allMessages) {
            latestByConversation.putIfAbsent(m.getConversationId(), m);
        }

        List<Map<String, Object>> inbox = new ArrayList<>();
        for (Message latest : latestByConversation.values()) {
            String otherId = latest.getSenderId().equals(userId)
                    ? latest.getReceiverId()
                    : latest.getSenderId();
            String otherName = latest.getSenderId().equals(userId)
                    ? latest.getReceiverName()
                    : latest.getSenderName();

            // Count unread in this conversation
            long unread = allMessages.stream()
                    .filter(m -> m.getConversationId().equals(latest.getConversationId())
                            && m.getReceiverId().equals(userId) && !m.isRead())
                    .count();

            Map<String, Object> entry = new HashMap<>();
            entry.put("userId", otherId);
            entry.put("userName", otherName);
            entry.put("lastMessage", latest.getContent());
            entry.put("lastMessageTime", latest.getCreatedAt());
            entry.put("unreadCount", unread);
            entry.put("conversationId", latest.getConversationId());
            inbox.add(entry);
        }

        return inbox;
    }

    public long getUnreadCount(String userId) {
        return messageRepository.countByReceiverIdAndReadFalse(userId);
    }
}
