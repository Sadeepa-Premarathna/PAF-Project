package com.sliit.paf.resource_service.config;

import com.sliit.paf.resource_service.entity.CampusResource;
import com.sliit.paf.resource_service.enums.ResourceStatus;
import com.sliit.paf.resource_service.enums.ResourceType;
import com.sliit.paf.resource_service.repository.CampusResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.util.List;

@Configuration
public class ResourceSeeder {

    @Bean
    public CommandLineRunner seedResources(CampusResourceRepository repo) {
        return args -> {
            if (repo.count() > 0) return; // Don't re-seed

            List<CampusResource> resources = List.of(
                // Labs
                resource("Computer Lab A", ResourceType.LAB, 40, "Block A - Floor 1", "08:00", "18:00"),
                resource("Computer Lab B", ResourceType.LAB, 40, "Block A - Floor 2", "08:00", "18:00"),
                resource("Computer Lab C", ResourceType.LAB, 35, "Block B - Floor 1", "08:00", "20:00"),
                resource("Network Lab", ResourceType.LAB, 25, "Block B - Floor 2", "09:00", "17:00"),
                resource("Electronics Lab", ResourceType.LAB, 30, "Block C - Floor 1", "08:00", "17:00"),

                // Library Rooms
                resource("Library Study Room 1", ResourceType.MEETING_ROOM, 8, "Library - Ground Floor", "07:00", "21:00"),
                resource("Library Study Room 2", ResourceType.MEETING_ROOM, 8, "Library - Ground Floor", "07:00", "21:00"),
                resource("Library Discussion Room", ResourceType.MEETING_ROOM, 15, "Library - Level 1", "08:00", "20:00"),
                resource("Library Group Study Area", ResourceType.MEETING_ROOM, 20, "Library - Level 2", "07:00", "22:00"),

                // Lecture Halls
                resource("Lecture Hall A", ResourceType.LECTURE_HALL, 120, "Main Building - Floor 1", "08:00", "18:00"),
                resource("Lecture Hall B", ResourceType.LECTURE_HALL, 80, "Main Building - Floor 2", "08:00", "18:00"),
                resource("Seminar Room 101", ResourceType.LECTURE_HALL, 50, "Academic Block - Floor 1", "08:00", "20:00"),

                // Equipment
                resource("Projector (Portable)", ResourceType.EQUIPMENT, 1, "IT Office - Block A", "08:00", "18:00"),
                resource("Laptop Set (5 units)", ResourceType.EQUIPMENT, 5, "IT Office - Block A", "09:00", "17:00"),
                resource("VR Headset Kit", ResourceType.EQUIPMENT, 3, "Multimedia Lab", "09:00", "17:00"),
                resource("3D Printer", ResourceType.EQUIPMENT, 1, "Innovation Lab", "10:00", "16:00")
            );

            repo.saveAll(resources);
            System.out.println("✅ Seeded " + resources.size() + " campus resources.");
        };
    }

    private CampusResource resource(String name, ResourceType type, int capacity, String location,
                                     String from, String to) {
        CampusResource r = new CampusResource();
        r.setName(name);
        r.setType(type);
        r.setCapacity(capacity);
        r.setLocation(location);
        r.setAvailableFrom(LocalTime.parse(from));
        r.setAvailableTo(LocalTime.parse(to));
        r.setStatus(ResourceStatus.ACTIVE);
        return r;
    }
}
