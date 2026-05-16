package com.crickx.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<User> findNearbyAvailablePlayers(double lng, double lat, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        return userRepository.findNearbyAvailablePlayers(lng, lat, radiusMeters);
    }

    public User toggleAvailability(String userId, boolean available, Double lng, Double lat, String locationName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvailable(available);
        if (lng != null && lat != null) {
            user.setLocation(new org.springframework.data.mongodb.core.geo.GeoJsonPoint(lng, lat));
        }
        if (locationName != null) {
            user.setLocationName(locationName);
        }
        return userRepository.save(user);
    }

    public User updateProfile(String userId, String name, User.SkillLevel skill, User.PreferredRole role, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (name != null) user.setName(name);
        if (skill != null) user.setSkill(skill);
        if (role != null) user.setPreferredRole(role);
        if (phone != null) user.setPhone(phone);
        return userRepository.save(user);
    }
}
