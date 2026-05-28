package com.proyectopresupuesto.admin;

import com.proyectopresupuesto.config.DataSeeder;
import com.proyectopresupuesto.presupuesto.PresupuestoRepository;
import com.proyectopresupuesto.usuario.Usuario;
import com.proyectopresupuesto.usuario.UsuarioDTO;
import com.proyectopresupuesto.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PresupuestoRepository presupuestoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DataSeeder dataSeeder;

    /** Borra TODOS los presupuestos */
    @DeleteMapping("/presupuestos")
    public ResponseEntity<Map<String, Object>> deleteAll() {
        long count = presupuestoRepository.count();
        presupuestoRepository.deleteAll();
        // Resetear contador de presupuestos en todos los usuarios
        usuarioRepository.resetPresupuestosCargados();
        return ResponseEntity.ok(Map.of(
            "message", "Todos los presupuestos fueron eliminados.",
            "eliminados", count
        ));
    }

    /** Borra un presupuesto por ID */
    @DeleteMapping("/presupuestos/{id}")
    public ResponseEntity<Map<String, String>> deleteOne(@PathVariable Long id) {
        if (!presupuestoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        presupuestoRepository.findById(id).ifPresent(p -> {
            Usuario u = p.getUsuario();
            if (u.getPresupuestosCargados() > 0) {
                u.setPresupuestosCargados(u.getPresupuestosCargados() - 1);
                usuarioRepository.save(u);
            }
        });
        presupuestoRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Presupuesto eliminado."));
    }

    /** Lista todos los usuarios (para panel admin) */
    @GetMapping("/usuarios")
    public List<UsuarioDTO> getUsuarios() {
        return usuarioRepository.findAll().stream().map(UsuarioDTO::from).toList();
    }

    /** Ejecuta el seed de presupuestos */
    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> ejecutarSeed() {
        try {
            long total = dataSeeder.ejecutarSeed();
            return ResponseEntity.ok(Map.of(
                "message", "Seed ejecutado correctamente.",
                "total", total
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Error al ejecutar seed: " + e.getMessage()
            ));
        }
    }
}
