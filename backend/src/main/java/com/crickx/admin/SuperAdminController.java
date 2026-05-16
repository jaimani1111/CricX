package com.crickx.admin;

import com.crickx.sport.Sport;
import com.crickx.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/sports")
    public ResponseEntity<Sport> addSport(@RequestBody Sport sport) {
        return ResponseEntity.ok(superAdminService.addSport(sport));
    }

    @GetMapping("/sports")
    public ResponseEntity<List<Sport>> getSports() {
        return ResponseEntity.ok(superAdminService.getAllSports());
    }

    @PostMapping("/users/{userId}/block")
    public ResponseEntity<Void> blockUser(@PathVariable String userId) {
        superAdminService.blockUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable String userId) {
        superAdminService.activateUser(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(superAdminService.getAllUsers());
    }
}
