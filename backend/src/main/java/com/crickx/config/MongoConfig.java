package com.crickx.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.index.GeospatialIndex;

@Configuration
public class MongoConfig {

    @Bean
    public org.springframework.boot.CommandLineRunner initIndices(org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
        return args -> {
            ensureGeoIndexes(mongoTemplate);
        };
    }

    private void ensureGeoIndexes(org.springframework.data.mongodb.core.MongoTemplate template) {
        try {
            template.indexOps("users").ensureIndex(new GeospatialIndex("location").typed(org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE));
            template.indexOps("matches").ensureIndex(new GeospatialIndex("location").typed(org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE));
            template.indexOps("challenges").ensureIndex(new GeospatialIndex("location").typed(org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE));
        } catch (Exception e) {
            // Logs are debug level so we don't spam if Mongo is slow to come up
        }
    }
}
