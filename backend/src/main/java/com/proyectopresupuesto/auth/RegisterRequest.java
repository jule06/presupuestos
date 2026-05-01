package com.proyectopresupuesto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank String nombre,
    @NotBlank String apellido,
    @Email @NotBlank String email,
    @NotBlank @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password
) {}
