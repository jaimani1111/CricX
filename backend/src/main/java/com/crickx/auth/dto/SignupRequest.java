package com.crickx.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String skill;        // BEGINNER, INTERMEDIATE, ADVANCED
    private String preferredRole; // BATSMAN, BOWLER, ALL_ROUNDER, WICKET_KEEPER
    private String phone;
    private boolean isPartner; // If true, registers as ADMIN
}
