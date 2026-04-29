package com.proyectopresupuesto.presupuesto;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PresupuestoSpec {

    public static Specification<Presupuesto> withFilters(
            TipoObra tipoObra,
            String provincia,
            CategoriaTerminacion categoria,
            Integer anioDesde,
            Integer anioHasta,
            BigDecimal m2Min,
            BigDecimal m2Max,
            BigDecimal costoM2Min,
            BigDecimal costoM2Max
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (tipoObra != null)
                predicates.add(cb.equal(root.get("tipoObra"), tipoObra));
            if (provincia != null && !provincia.isBlank())
                predicates.add(cb.like(cb.lower(root.get("provincia")), "%" + provincia.toLowerCase() + "%"));
            if (categoria != null)
                predicates.add(cb.equal(root.get("categoriaTerminacion"), categoria));
            if (anioDesde != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("anioPresupuesto"), anioDesde));
            if (anioHasta != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("anioPresupuesto"), anioHasta));
            if (m2Min != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("superficieM2"), m2Min));
            if (m2Max != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("superficieM2"), m2Max));
            if (costoM2Min != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("costoPorM2"), costoM2Min));
            if (costoM2Max != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("costoPorM2"), costoM2Max));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
