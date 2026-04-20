package com.example.event.service;

import com.example.event.model.Event;
import java.util.List;

public interface EventService {
    Event createEvent(Event event);
    List<Event> getAllEvents();
    List<Event> getEventsByDate(String date);
    List<Event> getEventsInRange(String startDate, String endDate);
    Event updateEvent(Long id, Event event);
    void deleteEvent(Long id);
}
