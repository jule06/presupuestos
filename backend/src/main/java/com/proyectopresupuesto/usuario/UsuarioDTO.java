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
        LocalDateTime fechaRegistro,
        Integer presupuestosCargados,
        Boolean accesoDesbloqueado
) {
    public static UsuarioDTO from(Usuario u) {
        return new UsuarioDTO(
                u.getId(), u.getEmail(), u.getNombre(), u.getApellido(),
                u.getFotoUrl(), u.getMatricula(), u.getProvincia(), u.getCiudad(),
                u.getFechaRegistro(), u.getPresupuestosCargados(), u.getAccesoDesbloqueado()
        );
    }
}
