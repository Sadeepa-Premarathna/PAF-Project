package com.example.event.service.impl;

import com.example.event.model.Event;
import com.example.event.repository.EventRepository;
import com.example.event.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Override
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getEventsByDate(String date) {
        return eventRepository.findByDate(date);
    }

    @Override
    public List<Event> getEventsInRange(String startDate, String endDate) {
        return eventRepository.findByDateBetween(startDate, endDate);
    }

    @Override
    public Event updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setDate(eventDetails.getDate());
        event.setStartTime(eventDetails.getStartTime());
        event.setEndTime(eventDetails.getEndTime());
        event.setLocation(eventDetails.getLocation());
        event.setType(eventDetails.getType());
        event.setOrganizer(eventDetails.getOrganizer());
        
        return eventRepository.save(event);
    }

    @Override
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
