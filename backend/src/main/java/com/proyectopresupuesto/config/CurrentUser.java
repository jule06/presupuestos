package com.proyectopresupuesto.config;

import com.proyectopresupuesto.usuario.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CurrentUser implements UserDetails {

    private final Long id;
    private final String email;
    private final boolean accesoDesbloqueado;
    private final Usuario.Rol rol;

    public CurrentUser(Long id, String email, boolean accesoDesbloqueado, Usuario.Rol rol) {
        this.id = id;
        this.email = email;
        this.accesoDesbloqueado = accesoDesbloqueado;
        this.rol = rol;
    }

    public Long getId() { return id; }
    public boolean isAccesoDesbloqueado() { return accesoDesbloqueado; }
    public Usuario.Rol getRol() { return rol; }
    public boolean isAdmin() { return rol == Usuario.Rol.ADMIN; }

    @Override public String getUsername() { return email; }
    @Override public String getPassword() { return null; }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
