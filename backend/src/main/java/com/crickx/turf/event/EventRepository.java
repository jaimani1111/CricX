package com.crickx.turf.event;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByOwnerId(String ownerId);
}
