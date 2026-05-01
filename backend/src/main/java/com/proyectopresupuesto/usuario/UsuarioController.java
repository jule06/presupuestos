package com.proyectopresupuesto.usuario;

import com.proyectopresupuesto.config.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> me(@AuthenticationPrincipal CurrentUser principal) {
        return usuarioRepository.findById(principal.getId())
                .map(u -> ResponseEntity.ok(UsuarioDTO.from(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioDTO> updateMe(
            @Valid @RequestBody UpdatePerfilRequest req,
            @AuthenticationPrincipal CurrentUser principal) {
        return usuarioRepository.findById(principal.getId())
                .map(u -> {
                    if (req.nombre() != null && !req.nombre().isBlank()) u.setNombre(req.nombre());
                    if (req.apellido() != null && !req.apellido().isBlank()) u.setApellido(req.apellido());
                    u.setTelefono(req.telefono());
                    u.setWhatsapp(req.whatsapp());
                    u.setDireccion(req.direccion());
                    if (req.ciudad() != null) u.setCiudad(req.ciudad());
                    if (req.provincia() != null) u.setProvincia(req.provincia());
                    u.setBio(req.bio());
                    u.setLinkedinUrl(validarUrl(req.linkedinUrl(), "linkedin.com"));
                    u.setInstagramUrl(validarUrl(req.instagramUrl(), "instagram.com"));
                    u.setBehanceUrl(validarUrl(req.behanceUrl(), "behance.net"));
                    u.setPinterestUrl(validarUrl(req.pinterestUrl(), "pinterest.com"));
                    u.setSitioWeb(req.sitioWeb() != null && !req.sitioWeb().isBlank() ? req.sitioWeb() : null);
                    // recalculate perfilCompleto
                    boolean completo = hasValue(u.getWhatsapp()) || hasValue(u.getLinkedinUrl()) ||
                            hasValue(u.getInstagramUrl()) || hasValue(u.getBehanceUrl()) || hasValue(u.getSitioWeb());
                    u.setPerfilCompleto(completo);
                    return ResponseEntity.ok(UsuarioDTO.from(usuarioRepository.save(u)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/contacto")
    public ResponseEntity<ContactoPublicoDTO> contacto(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .filter(u -> u.isPerfilCompleto())
                .map(u -> ResponseEntity.ok(ContactoPublicoDTO.from(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    private String validarUrl(String url, String dominio) {
        if (url == null || url.isBlank()) return null;
        return url.contains(dominio) ? url : null;
    }

    private boolean hasValue(String s) {
        return s != null && !s.isBlank();
    }
}
