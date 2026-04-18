package com.sliit.paf.resource_service.repository;

import com.sliit.paf.resource_service.entity.CampusResource;
import com.sliit.paf.resource_service.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CampusResourceRepository extends JpaRepository<CampusResource, Long> {

    @Query("""
            SELECT r
            FROM CampusResource r
            WHERE (:type IS NULL OR r.type = :type)
              AND (:capacity IS NULL OR r.capacity >= :capacity)
              AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))
            ORDER BY r.id ASC
            """)
    List<CampusResource> searchResources(
            @Param("type") ResourceType type,
            @Param("capacity") Integer capacity,
            @Param("location") String location
    );
}
