package com.proyectopresupuesto.usuario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor
public class Usuario {

    public enum AuthProvider { LOCAL, GOOGLE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "foto_url")
    private String fotoUrl;

    private String matricula;
    private String provincia;
    private String ciudad;

    private String telefono;
    private String whatsapp;
    private String direccion;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "behance_url")
    private String behanceUrl;

    @Column(name = "pinterest_url")
    private String pinterestUrl;

    @Column(name = "sitio_web")
    private String sitioWeb;

    @Column(name = "perfil_completo", nullable = false)
    private boolean perfilCompleto = false;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 10)
    private AuthProvider authProvider = AuthProvider.GOOGLE;

    @Column(name = "email_verificado", nullable = false)
    private boolean emailVerificado = false;

    @Column(name = "verification_token", length = 36)
    private String verificationToken;

    @Column(name = "verification_token_expiry")
    private LocalDateTime verificationTokenExpiry;

    @Column(name = "reset_password_token", length = 36)
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column(name = "presupuestos_cargados", nullable = false)
    private Integer presupuestosCargados = 0;

    @Column(name = "acceso_desbloqueado", nullable = false)
    private Boolean accesoDesbloqueado = false;
}
