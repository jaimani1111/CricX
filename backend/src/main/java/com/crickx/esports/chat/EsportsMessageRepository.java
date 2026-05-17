package com.crickx.esports.chat;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EsportsMessageRepository extends MongoRepository<EsportsMessage, String> {
    List<EsportsMessage> findByMatchIdOrderByTimestampAsc(String matchId);
}
