package com.crickx.turf;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TurfRepository extends MongoRepository<Turf, String> {
    List<Turf> findByOwnerId(String ownerId);
    // Nearby search logic will keep the same pattern as Matches/Players
}
