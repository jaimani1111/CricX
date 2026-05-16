package com.crickx.tournament;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends MongoRepository<Tournament, String> {
    List<Tournament> findByStatusOrderByDateTimeAsc(Tournament.TournamentStatus status);

    @org.springframework.data.mongodb.repository.Query("{ 'location': { $near: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } }, 'status': 'OPEN' }")
    List<Tournament> findNearbyOpenTournaments(double lng, double lat, double maxDistanceMeters);
}
