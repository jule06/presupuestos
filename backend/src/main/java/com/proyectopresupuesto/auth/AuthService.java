package com.proyectopresupuesto.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.proyectopresupuesto.usuario.Usuario;
import com.proyectopresupuesto.usuario.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final GoogleTokenVerifier googleVerifier;
    private final UsuarioRepository usuarioRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public AuthService(GoogleTokenVerifier googleVerifier, UsuarioRepository usuarioRepo,
                       JwtService jwtService, PasswordEncoder passwordEncoder, MailService mailService) {
        this.googleVerifier = googleVerifier;
        this.usuarioRepo = usuarioRepo;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = googleVerifier.verify(idToken);
        String googleId = payload.getSubject();
        String email    = payload.getEmail();
        String nombre   = (String) payload.get("given_name");
        String apellido = (String) payload.get("family_name");
        String fotoUrl  = (String) payload.get("picture");
        if (nombre == null) nombre = email.split("@")[0];
        if (apellido == null) apellido = "";

        boolean esNuevo = false;
        Usuario usuario = usuarioRepo.findByGoogleId(googleId)
                .or(() -> usuarioRepo.findByEmail(email))
                .orElse(null);

        if (usuario == null) {
            usuario = new Usuario();
            usuario.setGoogleId(googleId);
            usuario.setEmail(email);
            usuario.setNombre(nombre);
            usuario.setApellido(apellido);
            usuario.setFotoUrl(fotoUrl);
            usuario.setAuthProvider(Usuario.AuthProvider.GOOGLE);
            usuario.setEmailVerificado(true);
            usuario = usuarioRepo.save(usuario);
            esNuevo = true;
        } else if (usuario.getGoogleId() == null) {
            usuario.setGoogleId(googleId);
            usuario.setFotoUrl(fotoUrl);
            usuario.setAuthProvider(Usuario.AuthProvider.GOOGLE);
            usuario.setEmailVerificado(true);
            usuario = usuarioRepo.save(usuario);
        }

        String jwt = jwtService.generateToken(usuario);
        return new AuthResponse(jwt, esNuevo, usuario.getAccesoDesbloqueado());
    }

    /** Returns true if email verification was sent, false if mail is not configured (user auto-verified). */
    @Transactional
    public boolean register(RegisterRequest req) {
        if (usuarioRepo.existsByEmail(req.email())) {
            throw new AuthException("EMAIL_TAKEN");
        }
        boolean mailConfigured = mailUsername != null && !mailUsername.isBlank();
        String token = UUID.randomUUID().toString();
        Usuario u = new Usuario();
        u.setEmail(req.email());
        u.setNombre(req.nombre());
        u.setApellido(req.apellido());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setAuthProvider(Usuario.AuthProvider.LOCAL);
        u.setEmailVerificado(!mailConfigured);
        u.setVerificationToken(mailConfigured ? token : null);
        u.setVerificationTokenExpiry(mailConfigured ? LocalDateTime.now().plusHours(24) : null);
        usuarioRepo.save(u);
        if (mailConfigured) {
            try {
                mailService.sendVerificationEmail(u.getEmail(), u.getNombre(), token);
            } catch (MailException e) {
                log.error("Failed to send verification email to {}: {}", u.getEmail(), e.getMessage());
                throw new AuthException("MAIL_ERROR");
            }
        }
        return mailConfigured;
    }

    public AuthResponse loginLocal(LoginRequest req) {
        Usuario u = usuarioRepo.findByEmail(req.email())
                .orElseThrow(() -> new AuthException("INVALID_CREDENTIALS"));
        if (!Usuario.AuthProvider.LOCAL.equals(u.getAuthProvider())) {
            throw new AuthException("USE_GOOGLE");
        }
        if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
            throw new AuthException("INVALID_CREDENTIALS");
        }
        if (!u.isEmailVerificado()) {
            throw new AuthException("EMAIL_NOT_VERIFIED");
        }
        String jwt = jwtService.generateToken(u);
        return new AuthResponse(jwt, false, u.getAccesoDesbloqueado());
    }

    @Transactional
    public void verifyEmail(String token) {
        Usuario u = usuarioRepo.findByVerificationToken(token)
                .orElseThrow(() -> new AuthException("INVALID_TOKEN"));
        if (u.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthException("TOKEN_EXPIRED");
        }
        u.setEmailVerificado(true);
        u.setVerificationToken(null);
        u.setVerificationTokenExpiry(null);
        usuarioRepo.save(u);
    }

    @Transactional
    public void forgotPassword(String email) {
        usuarioRepo.findByEmail(email).ifPresent(u -> {
            if (!Usuario.AuthProvider.LOCAL.equals(u.getAuthProvider())) return;
            String token = UUID.randomUUID().toString();
            u.setResetPasswordToken(token);
            u.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
            usuarioRepo.save(u);
            mailService.sendPasswordResetEmail(u.getEmail(), u.getNombre(), token);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        Usuario u = usuarioRepo.findByResetPasswordToken(token)
                .orElseThrow(() -> new AuthException("INVALID_TOKEN"));
        if (u.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthException("TOKEN_EXPIRED");
        }
        u.setPasswordHash(passwordEncoder.encode(newPassword));
        u.setResetPasswordToken(null);
        u.setResetPasswordTokenExpiry(null);
        usuarioRepo.save(u);
    }

    @Transactional
    public void resendVerification(String email) {
        usuarioRepo.findByEmail(email).ifPresent(u -> {
            if (u.isEmailVerificado()) return;
            String token = UUID.randomUUID().toString();
            u.setVerificationToken(token);
            u.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
            usuarioRepo.save(u);
            mailService.sendVerificationEmail(u.getEmail(), u.getNombre(), token);
        });
    }
}
