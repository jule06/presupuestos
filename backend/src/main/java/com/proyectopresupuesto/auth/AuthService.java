package com.proyectopresupuesto.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.proyectopresupuesto.usuario.Usuario;
import com.proyectopresupuesto.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final GoogleTokenVerifier googleVerifier;
    private final UsuarioRepository usuarioRepo;
    private final JwtService jwtService;

    public AuthService(GoogleTokenVerifier googleVerifier,
                       UsuarioRepository usuarioRepo,
                       JwtService jwtService) {
        this.googleVerifier = googleVerifier;
        this.usuarioRepo = usuarioRepo;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = googleVerifier.verify(idToken);

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String nombre = (String) payload.get("given_name");
        String apellido = (String) payload.get("family_name");
        String fotoUrl = (String) payload.get("picture");

        if (nombre == null) nombre = email.split("@")[0];
        if (apellido == null) apellido = "";

        boolean esNuevo = false;
        Usuario usuario = usuarioRepo.findByGoogleId(googleId)
                .or(() -> usuarioRepo.findByEmail(email))
                .orElse(null);

        if (usuario == null) {
            usuario = new Usuario();
            usuario.setGoogleId(googleId);
            usuario.setEmail(email);
            usuario.setNombre(nombre);
            usuario.setApellido(apellido);
            usuario.setFotoUrl(fotoUrl);
            usuario = usuarioRepo.save(usuario);
            esNuevo = true;
        } else if (usuario.getGoogleId() == null) {
            // Cuenta existente por email, vincular google id
            usuario.setGoogleId(googleId);
            usuario.setFotoUrl(fotoUrl);
            usuario = usuarioRepo.save(usuario);
        }

        String jwt = jwtService.generateToken(usuario);
        return new AuthResponse(jwt, esNuevo, usuario.getAccesoDesbloqueado());
    }
}
