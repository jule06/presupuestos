package com.proyectopresupuesto.presupuesto;

import com.proyectopresupuesto.usuario.Usuario;
import com.proyectopresupuesto.usuario.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PresupuestoService {

    private final PresupuestoRepository presupuestoRepo;
    private final UsuarioRepository usuarioRepo;

    public PresupuestoService(PresupuestoRepository presupuestoRepo,
                               UsuarioRepository usuarioRepo) {
        this.presupuestoRepo = presupuestoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @Transactional
    public PresupuestoDTO crear(NuevoPresupuestoRequest req, Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        BigDecimal costoPorM2 = req.costoTotal()
                .divide(req.superficieM2(), 2, RoundingMode.HALF_UP);

        Presupuesto p = new Presupuesto();
        p.setTipoObra(req.tipoObra());
        p.setSuperficieM2(req.superficieM2());
        p.setProvincia(req.provincia());
        p.setCiudad(req.ciudad());
        p.setBarrio(req.barrio());
        p.setAnioPresupuesto(req.anioPresupuesto());
        p.setCategoriaTerminacion(req.categoriaTerminacion());
        p.setCostoTotal(req.costoTotal());
        p.setCostoPorM2(costoPorM2);
        p.setDesglose(req.desglose());
        p.setGanoTrabajo(req.ganoTrabajo());
        p.setTipoCliente(req.tipoCliente());
        p.setDuracionMeses(req.duracionMeses());
        p.setNotas(req.notas());
        boolean esAnonimo = req.anonimo() == null || req.anonimo();
        if (!esAnonimo && !usuario.isPerfilCompleto()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "PERFIL_INCOMPLETO");
        }
        p.setAnonimo(esAnonimo);
        p.setUsuario(usuario);

        Presupuesto saved = presupuestoRepo.save(p);

        usuario.setPresupuestosCargados(usuario.getPresupuestosCargados() + 1);
        if (!usuario.getAccesoDesbloqueado()) {
            usuario.setAccesoDesbloqueado(true);
        }
        usuarioRepo.save(usuario);

        return PresupuestoDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<PresupuestoDTO> listar(
            TipoObra tipoObra, String provincia, CategoriaTerminacion categoria,
            Integer anioDesde, Integer anioHasta,
            BigDecimal m2Min, BigDecimal m2Max,
            BigDecimal costoM2Min, BigDecimal costoM2Max,
            Long usuarioId, Pageable pageable) {

        verificarAcceso(usuarioId);

        Specification<Presupuesto> spec = PresupuestoSpec.withFilters(
                tipoObra, provincia, categoria,
                anioDesde, anioHasta, m2Min, m2Max, costoM2Min, costoM2Max);

        return presupuestoRepo.findAll(spec, pageable).map(PresupuestoDTO::from);
    }

    public EstadisticasDTO estadisticas(
            TipoObra tipoObra, String provincia, CategoriaTerminacion categoria,
            Integer anioDesde, Integer anioHasta,
            BigDecimal m2Min, BigDecimal m2Max,
            BigDecimal costoM2Min, BigDecimal costoM2Max,
            Long usuarioId) {

        verificarAcceso(usuarioId);

        EstadisticasDTO stats = presupuestoRepo.calcularEstadisticas(
                tipoObra, provincia, categoria,
                anioDesde, anioHasta, m2Min, m2Max, costoM2Min, costoM2Max);

        List<BigDecimal> valores = presupuestoRepo.findCostoPorM2ForMediana(
                tipoObra, provincia, categoria,
                anioDesde, anioHasta, m2Min, m2Max, costoM2Min, costoM2Max);

        stats.setMedianaCostoM2(EstadisticasDTO.calcularMediana(valores));

        Map<String, Long> distTipo = new LinkedHashMap<>();
        presupuestoRepo.countByTipoObra().forEach(row ->
                distTipo.put(row[0].toString(), (Long) row[1]));
        stats.setDistribucionPorTipo(distTipo);

        Map<String, Long> distCat = new LinkedHashMap<>();
        presupuestoRepo.countByCategoria().forEach(row ->
                distCat.put(row[0].toString(), (Long) row[1]));
        stats.setDistribucionPorCategoria(distCat);

        return stats;
    }

    public long contarTotal() {
        return presupuestoRepo.count();
    }

    public List<PresupuestoDTO> preview() {
        return presupuestoRepo.findAll(Pageable.ofSize(3)).stream()
                .map(PresupuestoDTO::preview)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PresupuestoDTO> misPresupuestos(Long usuarioId) {
        return presupuestoRepo.findByUsuarioId(usuarioId).stream()
                .map(PresupuestoDTO::from)
                .toList();
    }

    @Transactional
    public void eliminar(Long id, Long usuarioId) {
        Presupuesto p = presupuestoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!p.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        presupuestoRepo.delete(p);

        Usuario usuario = p.getUsuario();
        int nuevaCantidad = Math.max(0, usuario.getPresupuestosCargados() - 1);
        usuario.setPresupuestosCargados(nuevaCantidad);
        if (nuevaCantidad == 0) {
            usuario.setAccesoDesbloqueado(false);
        }
        usuarioRepo.save(usuario);
    }

    private void verificarAcceso(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (usuario.getPresupuestosCargados() <= 0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Debés cargar al menos un presupuesto para acceder");
        }
    }
}
