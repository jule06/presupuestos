package com.proyectopresupuesto.presupuesto;

import com.proyectopresupuesto.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "presupuestos")
@Getter @Setter @NoArgsConstructor
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_obra", nullable = false)
    private TipoObra tipoObra;

    @Column(name = "superficie_m2", nullable = false)
    private BigDecimal superficieM2;

    @Column(nullable = false)
    private String provincia;

    @Column(nullable = false)
    private String ciudad;

    private String barrio;

    @Column(name = "anio_presupuesto", nullable = false)
    private Integer anioPresupuesto;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria_terminacion", nullable = false)
    private CategoriaTerminacion categoriaTerminacion;

    @Column(name = "costo_total", nullable = false)
    private BigDecimal costoTotal;

    @Column(name = "costo_por_m2", nullable = false)
    private BigDecimal costoPorM2;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> desglose;

    @Enumerated(EnumType.STRING)
    @Column(name = "gano_trabajo", nullable = false)
    private GanoTrabajo ganoTrabajo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cliente", nullable = false)
    private TipoCliente tipoCliente;

    @Column(name = "duracion_meses")
    private Integer duracionMeses;

    @Column(length = 500)
    private String notas;

    @Column(nullable = false)
    private boolean anonimo = true;

    @Column(name = "fecha_carga", nullable = false)
    private LocalDateTime fechaCarga = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
