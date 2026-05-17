package com.crickx.esports.tournament;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EsportsTournamentRepository extends MongoRepository<EsportsTournament, String> {
}
