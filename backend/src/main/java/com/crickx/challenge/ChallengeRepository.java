package com.crickx.challenge;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends MongoRepository<Challenge, String> {

    @Query("{ 'status': 'OPEN', 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } } }")
    List<Challenge> findNearbyOpenChallenges(double longitude, double latitude, double maxDistanceMeters);

    List<Challenge> findByCreatedBy(String userId);

    @Query("{ $or: [ { 'createdBy': ?0 }, { 'acceptedBy': ?0 } ] }")
    List<Challenge> findByParticipant(String userId);
}
