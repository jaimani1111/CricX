package com.crickx.auth;

import com.crickx.admin.SuperAdminService;
import com.crickx.auth.dto.AuthResponse;
import com.crickx.auth.dto.LoginRequest;
import com.crickx.auth.dto.SignupRequest;
import com.crickx.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SuperAdminService superAdminService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verify(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        authService.verifyOtp(email, otp);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully. You can now login.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        authService.resendOtp(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "New OTP sent to your email.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * DEV ONLY: Promote a user to SUPER_ADMIN or ADMIN.
     * Usage: POST /api/auth/promote-role { "email": "...", "role": "SUPER_ADMIN" }
     * REMOVE THIS IN PRODUCTION!
     */
    @PostMapping("/promote-role")
    public ResponseEntity<Map<String, String>> promoteRole(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String roleName = payload.get("role");
        Role role = Role.valueOf(roleName.toUpperCase());
        superAdminService.promoteToRole(email, role);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User " + email + " promoted to " + role.name());
        return ResponseEntity.ok(response);
    }
}

