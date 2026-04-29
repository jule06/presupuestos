package com.proyectopresupuesto.presupuesto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long>,
        JpaSpecificationExecutor<Presupuesto> {

    List<Presupuesto> findByUsuarioId(Long usuarioId);

    long countByUsuarioId(Long usuarioId);

    @Query("""
        SELECT new com.proyectopresupuesto.presupuesto.EstadisticasDTO(
            AVG(p.costoPorM2),
            MIN(p.costoPorM2),
            MAX(p.costoPorM2),
            COUNT(p)
        ) FROM Presupuesto p
        WHERE (:tipoObra IS NULL OR p.tipoObra = :tipoObra)
          AND (:provincia IS NULL OR LOWER(p.provincia) = LOWER(:provincia))
          AND (:categoria IS NULL OR p.categoriaTerminacion = :categoria)
          AND (:anioDesde IS NULL OR p.anioPresupuesto >= :anioDesde)
          AND (:anioHasta IS NULL OR p.anioPresupuesto <= :anioHasta)
          AND (:m2Min IS NULL OR p.superficieM2 >= :m2Min)
          AND (:m2Max IS NULL OR p.superficieM2 <= :m2Max)
          AND (:costoM2Min IS NULL OR p.costoPorM2 >= :costoM2Min)
          AND (:costoM2Max IS NULL OR p.costoPorM2 <= :costoM2Max)
        """)
    EstadisticasDTO calcularEstadisticas(
            @Param("tipoObra") TipoObra tipoObra,
            @Param("provincia") String provincia,
            @Param("categoria") CategoriaTerminacion categoria,
            @Param("anioDesde") Integer anioDesde,
            @Param("anioHasta") Integer anioHasta,
            @Param("m2Min") BigDecimal m2Min,
            @Param("m2Max") BigDecimal m2Max,
            @Param("costoM2Min") BigDecimal costoM2Min,
            @Param("costoM2Max") BigDecimal costoM2Max
    );

    @Query("""
        SELECT p.costoPorM2 FROM Presupuesto p
        WHERE (:tipoObra IS NULL OR p.tipoObra = :tipoObra)
          AND (:provincia IS NULL OR LOWER(p.provincia) = LOWER(:provincia))
          AND (:categoria IS NULL OR p.categoriaTerminacion = :categoria)
          AND (:anioDesde IS NULL OR p.anioPresupuesto >= :anioDesde)
          AND (:anioHasta IS NULL OR p.anioPresupuesto <= :anioHasta)
          AND (:m2Min IS NULL OR p.superficieM2 >= :m2Min)
          AND (:m2Max IS NULL OR p.superficieM2 <= :m2Max)
          AND (:costoM2Min IS NULL OR p.costoPorM2 >= :costoM2Min)
          AND (:costoM2Max IS NULL OR p.costoPorM2 <= :costoM2Max)
        ORDER BY p.costoPorM2
        """)
    List<BigDecimal> findCostoPorM2ForMediana(
            @Param("tipoObra") TipoObra tipoObra,
            @Param("provincia") String provincia,
            @Param("categoria") CategoriaTerminacion categoria,
            @Param("anioDesde") Integer anioDesde,
            @Param("anioHasta") Integer anioHasta,
            @Param("m2Min") BigDecimal m2Min,
            @Param("m2Max") BigDecimal m2Max,
            @Param("costoM2Min") BigDecimal costoM2Min,
            @Param("costoM2Max") BigDecimal costoM2Max
    );

    @Query("""
        SELECT p.tipoObra, COUNT(p) FROM Presupuesto p
        GROUP BY p.tipoObra
        """)
    List<Object[]> countByTipoObra();

    @Query("""
        SELECT p.categoriaTerminacion, COUNT(p) FROM Presupuesto p
        GROUP BY p.categoriaTerminacion
        """)
    List<Object[]> countByCategoria();
}
