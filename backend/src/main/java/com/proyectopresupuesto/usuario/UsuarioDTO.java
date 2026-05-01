package com.proyectopresupuesto.usuario;

import java.time.LocalDateTime;

public record UsuarioDTO(
        Long id,
        String email,
        String nombre,
        String apellido,
        String fotoUrl,
        String matricula,
        String provincia,
        String ciudad,
        String telefono,
        String whatsapp,
        String direccion,
        String bio,
        String linkedinUrl,
        String instagramUrl,
        String behanceUrl,
        String pinterestUrl,
        String sitioWeb,
        boolean perfilCompleto,
        LocalDateTime fechaRegistro,
        Integer presupuestosCargados,
        Boolean accesoDesbloqueado
) {
    public static UsuarioDTO from(Usuario u) {
        return new UsuarioDTO(
                u.getId(), u.getEmail(), u.getNombre(), u.getApellido(),
                u.getFotoUrl(), u.getMatricula(), u.getProvincia(), u.getCiudad(),
                u.getTelefono(), u.getWhatsapp(), u.getDireccion(), u.getBio(),
                u.getLinkedinUrl(), u.getInstagramUrl(), u.getBehanceUrl(),
                u.getPinterestUrl(), u.getSitioWeb(), u.isPerfilCompleto(),
                u.getFechaRegistro(), u.getPresupuestosCargados(), u.getAccesoDesbloqueado()
        );
    }
}
