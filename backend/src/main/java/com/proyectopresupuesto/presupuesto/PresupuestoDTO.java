package com.proyectopresupuesto.presupuesto;

import com.proyectopresupuesto.usuario.ContactoPublicoDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public record PresupuestoDTO(
        Long id,
        String tipoObra,
        BigDecimal superficieM2,
        String provincia,
        String ciudad,
        String barrio,
        Integer anioPresupuesto,
        String categoriaTerminacion,
        BigDecimal costoTotal,
        BigDecimal costoPorM2,
        Map<String, Object> desglose,
        String ganoTrabajo,
        String tipoCliente,
        Integer duracionMeses,
        String notas,
        LocalDateTime fechaCarga,
        Boolean anonimo,
        ContactoPublicoDTO contacto
) {
    public static PresupuestoDTO from(Presupuesto p) {
        return new PresupuestoDTO(
                p.getId(),
                p.getTipoObra().name(),
                p.getSuperficieM2(),
                p.getProvincia(),
                p.getCiudad(),
                p.getBarrio(),
                p.getAnioPresupuesto(),
                p.getCategoriaTerminacion().name(),
                p.getCostoTotal(),
                p.getCostoPorM2(),
                p.getDesglose(),
                p.getGanoTrabajo().name(),
                p.getTipoCliente().name(),
                p.getDuracionMeses(),
                p.getNotas(),
                p.getFechaCarga(),
                p.isAnonimo(),
                !p.isAnonimo() ? ContactoPublicoDTO.from(p.getUsuario()) : null
        );
    }

    public static PresupuestoDTO preview(Presupuesto p) {
        return new PresupuestoDTO(
                p.getId(),
                p.getTipoObra().name(),
                p.getSuperficieM2(),
                p.getProvincia(),
                p.getCiudad(),
                null, null,
                p.getCategoriaTerminacion().name(),
                p.getCostoTotal(),
                p.getCostoPorM2(),
                null, null, null, null, null,
                p.getFechaCarga(),
                true,
                null
        );
    }
}
