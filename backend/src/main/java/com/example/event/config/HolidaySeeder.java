package com.example.event.config;

import com.example.event.model.Event;
import com.example.event.repository.EventRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class HolidaySeeder {

    @Bean
    CommandLineRunner seedHolidays(EventRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                // If there are already events, we skip seeding to avoid duplicates
                // (In a real app, we might check for specific holiday tags)
                return;
            }

            List<Event> holidays = new ArrayList<>();

            // 2026 Public Holidays
            holidays.add(new Event(null, "Tamil Thai Pongal Day", "Public Holiday", "2026-01-15", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "National Independence Day", "Independence Day of Sri Lanka", "2026-02-04", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Mahasivarathri Day", "Religious Holiday", "2026-02-15", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Good Friday", "Religious Holiday", "2026-04-03", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Sinhala & Tamil New Year (Eve)", "Cultural Holiday", "2026-04-13", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Sinhala & Tamil New Year Day", "Cultural Holiday", "2026-04-14", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "May Day", "International Labour Day", "2026-05-01", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Vesak Full Moon Poya Day", "Religious Holiday", "2026-05-01", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Vesak Day 2", "Religious Holiday", "2026-05-02", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Id-Ul-Alha (Hadji Festival)", "Religious Holiday", "2026-05-28", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));
            holidays.add(new Event(null, "Christmas Day", "Religious Holiday", "2026-12-25", "00:00", "23:59", "Sri Lanka", "Holiday", "Government"));

            // 2026 Poya Days
            holidays.add(new Event(null, "Duruthu Full Moon Poya Day", "Buddhist Holiday", "2026-01-03", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Navam Full Moon Poya Day", "Buddhist Holiday", "2026-02-01", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Medin Full Moon Poya Day", "Buddhist Holiday", "2026-03-03", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Bak Full Moon Poya Day", "Buddhist Holiday", "2026-04-01", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Poson Full Moon Poya Day", "Buddhist Holiday", "2026-05-31", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Esala Full Moon Poya Day", "Buddhist Holiday", "2026-06-29", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Nikini Full Moon Poya Day", "Buddhist Holiday", "2026-07-28", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Binara Full Moon Poya Day", "Buddhist Holiday", "2026-08-26", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Vap Full Moon Poya Day", "Buddhist Holiday", "2026-09-25", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Il Full Moon Poya Day", "Buddhist Holiday", "2026-10-24", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));
            holidays.add(new Event(null, "Unduvap Full Moon Poya Day", "Buddhist Holiday", "2026-11-22", "00:00", "23:59", "Sri Lanka", "Holiday", "Buddhist Council"));

            repository.saveAll(holidays);
            System.out.println("Sri Lankan Holidays and Poya days seeded successfully!");
        };
    }
}
