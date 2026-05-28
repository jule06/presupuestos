package com.proyectopresupuesto.config;

import com.proyectopresupuesto.presupuesto.PresupuestoRepository;
import com.proyectopresupuesto.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile("!test")
public class DataSeeder implements ApplicationRunner {

    private final PresupuestoRepository presupuestoRepository;
    private final UsuarioRepository usuarioRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        if (presupuestoRepository.count() > 0) {
            log.info("DataSeeder: ya existen presupuestos en la base de datos, seed omitido.");
            return;
        }
        ejecutarSeed();
    }

    public long ejecutarSeed() {
        if (usuarioRepository.count() == 0) {
            throw new IllegalStateException("No hay usuarios registrados.");
        }
        try {
            log.info("DataSeeder: cargando presupuestos de muestra...");
            ClassPathResource resource = new ClassPathResource("db/seed/seed_presupuestos.sql");
            String sql = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            jdbcTemplate.execute(sql);
            long total = presupuestoRepository.count();
            log.info("DataSeeder: seed completado. Total presupuestos: {}", total);
            return total;
        } catch (Exception e) {
            log.error("DataSeeder: error al ejecutar el seed — {}", e.getMessage(), e);
            throw new RuntimeException("Error al ejecutar el seed: " + e.getMessage(), e);
        }
    }
}
