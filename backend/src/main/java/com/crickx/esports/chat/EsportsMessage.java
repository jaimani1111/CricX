package com.crickx.esports.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "esports_messages")
public class EsportsMessage {

    @Id
    private String id;

    private String matchId; // lobby identifier
    private String senderId;
    private String senderName;
    private String content;
    private Instant timestamp;
    
    @Builder.Default
    private boolean isSystem = false;
}
