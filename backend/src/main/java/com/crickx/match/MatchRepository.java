package com.crickx.match;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } } }")
    List<Match> findNearbyOpenMatches(double longitude, double latitude, double maxDistanceMeters);

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'sport': ?3 }")
    List<Match> findNearbyOpenMatchesBySport(double longitude, double latitude, double maxDistanceMeters, String sport);

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'sport': ?3, 'skillLevel': ?4 }")
    List<Match> findNearbyOpenMatchesBySportAndSkill(double longitude, double latitude, double maxDistanceMeters, String sport, String skillLevel);

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'sport': ?3, 'matchType': ?4 }")
    List<Match> findNearbyOpenMatchesBySportAndType(double longitude, double latitude, double maxDistanceMeters, String sport, String matchType);

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'sport': ?3, 'skillLevel': ?4, 'matchType': ?5 }")
    List<Match> findNearbyOpenMatchesBySportSkillAndType(double longitude, double latitude, double maxDistanceMeters, String sport, String skillLevel, String matchType);

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'skillLevel': ?3 }")
    List<Match> findNearbyOpenMatchesBySkill(double longitude, double latitude, double maxDistanceMeters, String skillLevel);

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'matchType': ?3 }")
    List<Match> findNearbyOpenMatchesByType(double longitude, double latitude, double maxDistanceMeters, String matchType);

    @Query("{ 'status': { $in: ['OPEN'] }, 'location': { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'skillLevel': ?3, 'matchType': ?4 }")
    List<Match> findNearbyOpenMatchesBySkillAndType(double longitude, double latitude, double maxDistanceMeters, String skillLevel, String matchType);

    List<Match> findByCreatedBy(String userId);

    @Query("{ 'playersJoined': ?0 }")
    List<Match> findByPlayerJoined(String userId);

    Page<Match> findByStatus(Match.MatchStatus status, Pageable pageable);
}
