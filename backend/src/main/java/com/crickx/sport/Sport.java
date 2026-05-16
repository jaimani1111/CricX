package com.crickx.sport;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sports")
public class Sport {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String name;
    
    private String icon; // Icon name for frontend
    private boolean active = true;
}
