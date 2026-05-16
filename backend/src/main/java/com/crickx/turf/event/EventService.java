package com.crickx.turf.event;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;

    public Event createEvent(Event event) {
        event.setStatus(Event.EventStatus.UPCOMING);
        return eventRepository.save(event);
    }

    public List<Event> getMyEvents(String ownerId) {
        return eventRepository.findByOwnerId(ownerId);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(String id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event registerUser(String eventId, String userId) {
        Event event = getEventById(eventId);
        if (!event.getRegisteredUserIds().contains(userId)) {
            event.getRegisteredUserIds().add(userId);
        }
        return eventRepository.save(event);
    }
}
