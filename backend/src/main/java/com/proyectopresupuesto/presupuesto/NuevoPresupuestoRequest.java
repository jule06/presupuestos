package com.proyectopresupuesto.presupuesto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.Map;

public record NuevoPresupuestoRequest(
        @NotNull TipoObra tipoObra,
        @NotNull @Positive BigDecimal superficieM2,
        @NotBlank String provincia,
        @NotBlank String ciudad,
        String barrio,
        @NotNull @Min(2000) @Max(2100) Integer anioPresupuesto,
        @NotNull CategoriaTerminacion categoriaTerminacion,
        @NotNull @Positive BigDecimal costoTotal,
        Map<String, Object> desglose,
        @NotNull GanoTrabajo ganoTrabajo,
        @NotNull TipoCliente tipoCliente,
        @Positive Integer duracionMeses,
        @Size(max = 500) String notas
) {}
