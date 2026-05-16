package com.crickx.admin;

import com.crickx.sport.Sport;
import com.crickx.sport.SportRepository;
import com.crickx.user.Role;
import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final SportRepository sportRepository;
    private final UserRepository userRepository;

    public Sport addSport(Sport sport) {
        if (sportRepository.findByNameIgnoreCase(sport.getName()).isPresent()) {
            throw new RuntimeException("Sport already exists");
        }
        return sportRepository.save(sport);
    }

    public List<Sport> getAllSports() {
        return sportRepository.findAll();
    }

    public void blockUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(true);
        userRepository.save(user);
    }

    public void activateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(false);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User promoteToRole(String email, Role role) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        user.setRole(role);
        return userRepository.save(user);
    }
}
