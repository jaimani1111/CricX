package com.crickx.auth;

import com.crickx.auth.dto.AuthResponse;
import com.crickx.auth.dto.LoginRequest;
import com.crickx.auth.dto.SignupRequest;
import com.crickx.user.Role;
import com.crickx.user.User;
import com.crickx.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername().toLowerCase())) {
            throw new RuntimeException("Username already taken");
        }

        // DEV MODE: Auto-verify users so login works without email OTP
        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername().toLowerCase())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .skill(parseSkill(request.getSkill()))
                .preferredRole(parseRole(request.getPreferredRole()))
                .phone(request.getPhone())
                .role(request.isPartner() ? Role.ADMIN : Role.PLAYER) // Register as ADMIN if partner
                .isEmailVerified(true)  // Auto-verify in dev
                .isBlocked(false)
                .build();

        user = userRepository.save(user);

        // Generate token immediately since user is auto-verified
        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return AuthResponse.from(token, user);
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("User already verified");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            throw new RuntimeException("Invalid OTP code");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("User already verified");
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please verify your OTP.");
        }

        if (user.isBlocked()) {
            throw new RuntimeException("Account is blocked. Please contact support.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return AuthResponse.from(token, user);
    }

    private User.SkillLevel parseSkill(String skill) {
        if (skill == null) return User.SkillLevel.INTERMEDIATE;
        try {
            return User.SkillLevel.valueOf(skill.toUpperCase());
        } catch (IllegalArgumentException e) {
            return User.SkillLevel.INTERMEDIATE;
        }
    }

    private User.PreferredRole parseRole(String role) {
        if (role == null) return null;
        try {
            return User.PreferredRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
