package com.crickx.esports.match;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EsportsMatchRepository extends MongoRepository<EsportsMatch, String> {
    List<EsportsMatch> findByHostId(String hostId);
    
    @Query("{ 'joinedUserIds': ?0 }")
    List<EsportsMatch> findByJoinedUser(String userId);
}
