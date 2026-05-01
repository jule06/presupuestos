package com.proyectopresupuesto.auth;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request.idToken()));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody @Valid RegisterRequest req) {
        boolean verificationSent = authService.register(req);
        return ResponseEntity.ok(Map.of("verificationRequired", verificationSent));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginLocal(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(authService.loginLocal(req));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequest req) {
        authService.forgotPassword(req.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@RequestBody @Valid ForgotPasswordRequest req) {
        authService.resendVerification(req.email());
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, String>> handleAuthException(AuthException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
