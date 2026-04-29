package com.proyectopresupuesto.presupuesto;

import com.proyectopresupuesto.config.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/presupuestos")
public class PresupuestoController {

    private final PresupuestoService service;

    public PresupuestoController(PresupuestoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PresupuestoDTO> crear(
            @Valid @RequestBody NuevoPresupuestoRequest request,
            @AuthenticationPrincipal CurrentUser principal) {
        PresupuestoDTO dto = service.crear(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<Page<PresupuestoDTO>> listar(
            @RequestParam(required = false) TipoObra tipoObra,
            @RequestParam(required = false) String provincia,
            @RequestParam(required = false) CategoriaTerminacion categoriaTerminacion,
            @RequestParam(required = false) Integer anioDesde,
            @RequestParam(required = false) Integer anioHasta,
            @RequestParam(required = false) BigDecimal m2Min,
            @RequestParam(required = false) BigDecimal m2Max,
            @RequestParam(required = false) BigDecimal costoM2Min,
            @RequestParam(required = false) BigDecimal costoM2Max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaCarga") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal CurrentUser principal) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);

        Page<PresupuestoDTO> result = service.listar(
                tipoObra, provincia, categoriaTerminacion,
                anioDesde, anioHasta, m2Min, m2Max, costoM2Min, costoM2Max,
                principal.getId(), pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasDTO> estadisticas(
            @RequestParam(required = false) TipoObra tipoObra,
            @RequestParam(required = false) String provincia,
            @RequestParam(required = false) CategoriaTerminacion categoriaTerminacion,
            @RequestParam(required = false) Integer anioDesde,
            @RequestParam(required = false) Integer anioHasta,
            @RequestParam(required = false) BigDecimal m2Min,
            @RequestParam(required = false) BigDecimal m2Max,
            @RequestParam(required = false) BigDecimal costoM2Min,
            @RequestParam(required = false) BigDecimal costoM2Max,
            @AuthenticationPrincipal CurrentUser principal) {

        EstadisticasDTO stats = service.estadisticas(
                tipoObra, provincia, categoriaTerminacion,
                anioDesde, anioHasta, m2Min, m2Max, costoM2Min, costoM2Max,
                principal.getId());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/preview")
    public ResponseEntity<List<PresupuestoDTO>> preview() {
        return ResponseEntity.ok(service.preview());
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {
        return ResponseEntity.ok(Map.of("total", service.contarTotal()));
    }

    @GetMapping("/mis")
    public ResponseEntity<List<PresupuestoDTO>> mis(
            @AuthenticationPrincipal CurrentUser principal) {
        return ResponseEntity.ok(service.misPresupuestos(principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal CurrentUser principal) {
        service.eliminar(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
