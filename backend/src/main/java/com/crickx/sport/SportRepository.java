package com.crickx.sport;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface SportRepository extends MongoRepository<Sport, String> {
    Optional<Sport> findByNameIgnoreCase(String name);
    List<Sport> findAllByActive(boolean active);
}
