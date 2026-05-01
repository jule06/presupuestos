package com.proyectopresupuesto.usuario;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePerfilRequest(
    String nombre,
    String apellido,
    String telefono,
    @Pattern(regexp = "^([0-9]{10,15})?$", message = "WhatsApp debe tener solo números, mínimo 10 dígitos")
    String whatsapp,
    String direccion,
    String ciudad,
    String provincia,
    @Size(max = 300) String bio,
    String linkedinUrl,
    String instagramUrl,
    String behanceUrl,
    String pinterestUrl,
    String sitioWeb
) {}
