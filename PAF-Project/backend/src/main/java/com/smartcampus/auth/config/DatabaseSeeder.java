package com.smartcampus.auth.config;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.auth.service.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder {

    private final PasswordService passwordService;

    @Bean
    public CommandLineRunner seedDatabase(AppUserRepository userRepository) {
        return args -> {
            // Seed Admin
            if (!userRepository.existsByEmail("admin@smartcampus.com")) {
                AppUser admin = AppUser.builder()
                        .name("System Admin")
                        .studentId("ADMIN001")
                        .department("IT Administration")
                        .email("admin@smartcampus.com")
                        .passwordHash(passwordService.hash("Admin@123"))
                        .role(Role.ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
                log.info("Seeded Admin user: admin@smartcampus.com / Admin@123");
            }

            // Seed Staff Member
            if (!userRepository.existsByEmail("staff@smartcampus.com")) {
                AppUser staff = AppUser.builder()
                        .name("Staff Member")
                        .studentId("STAFF001")
                        .department("Management")
                        .email("staff@smartcampus.com")
                        .passwordHash(passwordService.hash("Staff@123"))
                        .role(Role.STAFF_MEMBER)
                        .active(true)
                        .build();
                userRepository.save(staff);
                log.info("Seeded Staff Member user: staff@smartcampus.com / Staff@123");
            }
        };
    }
}
