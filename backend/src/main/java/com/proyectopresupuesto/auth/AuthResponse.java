package com.proyectopresupuesto.auth;

public record AuthResponse(String token, boolean esNuevo, boolean accesoDesbloqueado) {}
