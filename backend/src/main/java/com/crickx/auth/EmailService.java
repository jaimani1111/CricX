package com.crickx.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final WebClient webClient;
    
    @Value("${resend.api.key}")
    private String apiKey;

    public EmailService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.resend.com").build();
    }

    public void sendOtpEmail(String to, String otp) {
        String ownerEmail = "choudharyjaimani@gmail.com";
        log.info("REDIRECTING OTP email from {} to verified owner: {}", to, ownerEmail);
        
        Map<String, Object> body = new HashMap<>();
        body.put("from", "CrickX <onboarding@resend.dev>");
        body.put("to", ownerEmail);
        body.put("subject", "DEVELOPMENT: OTP for " + to);
        body.put("html", "<h1>Welcome to CrickX!</h1>" +
                        "<p><strong>DEVELOPMENT MODE:</strong> This email was originally intended for: " + to + "</p>" +
                        "<p>Your verification code is: <strong>" + otp + "</strong></p>" +
                        "<p>This code will expire in 10 minutes.</p>");

        this.webClient.post()
                .uri("/emails")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .doOnSuccess(res -> log.info("Email sent successfully to {}", to))
                .doOnError(err -> log.error("Failed to send email: {}", err.getMessage()))
                .subscribe(); // Fire and forget for internal process
    }

    public void sendForgotPasswordOtp(String to, String otp) {
        String ownerEmail = "choudharyjaimani@gmail.com";
        log.info("REDIRECTING Forgot Password OTP from {} to verified owner: {}", to, ownerEmail);
        
        Map<String, Object> body = new HashMap<>();
        body.put("from", "CrickX <onboarding@resend.dev>");
        body.put("to", ownerEmail);
        body.put("subject", "DEVELOPMENT: Password Reset for " + to);
        body.put("html", "<h1>Password Reset Request</h1>" +
                        "<p><strong>DEVELOPMENT MODE:</strong> This email was originally intended for: " + to + "</p>" +
                        "<p>You requested a password reset. Use the code below to proceed:</p>" +
                        "<h2>" + otp + "</h2>" +
                        "<p>If you didn't request this, please ignore this email.</p>");

        this.webClient.post()
                .uri("/emails")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .doOnSuccess(res -> log.info("Password reset email sent to {}", to))
                .doOnError(err -> log.error("Failed to send reset email: {}", err.getMessage()))
                .subscribe();
    }
}
