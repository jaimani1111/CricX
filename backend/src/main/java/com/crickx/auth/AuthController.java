package com.crickx.auth;

import com.crickx.admin.SuperAdminService;
import com.crickx.auth.dto.AuthResponse;
import com.crickx.auth.dto.LoginRequest;
import com.crickx.auth.dto.SignupRequest;
import com.crickx.user.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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

    @Value("${setup.secret:CRICKX-JAIMANI-OWNER-2024}")
    private String setupSecret;

    private static final String OWNER_EMAIL = "jaimanichoudhary446@gmail.com";

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
     * SECURED: Promote a user to SUPER_ADMIN or ADMIN.
     * Requires a secret key and only works for the owner's email.
     */
    @PostMapping("/promote-role")
    public ResponseEntity<Map<String, String>> promoteRole(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String roleName = payload.get("role");
        String secret = payload.get("secretKey");

        // Security: Validate the secret key
        if (secret == null || !secret.equals(setupSecret)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid secret key. Access denied.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        // Security: Only allow SUPER_ADMIN promotion for the owner
        if ("SUPER_ADMIN".equalsIgnoreCase(roleName) && !OWNER_EMAIL.equalsIgnoreCase(email)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Only the platform owner can be promoted to Super Admin.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        Role role = Role.valueOf(roleName.toUpperCase());
        superAdminService.promoteToRole(email, role);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User " + email + " promoted to " + role.name());
        return ResponseEntity.ok(response);
    }
}
