package com.crickx.esports.profile;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EsportsProfileRepository extends MongoRepository<EsportsProfile, String> {
}
