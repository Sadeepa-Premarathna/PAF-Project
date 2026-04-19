package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.smartcampus", "com.example", "com.sliit.paf"})
@EnableJpaRepositories(basePackages = {"com.smartcampus", "com.example", "com.sliit.paf"})
@EntityScan(basePackages = {"com.smartcampus", "com.example", "com.sliit.paf"})
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }

}
