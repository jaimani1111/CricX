package com.crickx.turf.event;

import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminEventController {
    private final EventService eventService;

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event, @AuthenticationPrincipal User user) {
        event.setOwnerId(user.getId());
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Event>> getMyEvents(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventService.getMyEvents(user.getId()));
    }

    @GetMapping("/{eventId}/participants")
    public ResponseEntity<List<User>> getEventParticipants(
            @PathVariable String eventId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventService.getEventParticipants(eventId, user.getId()));
    }
}
