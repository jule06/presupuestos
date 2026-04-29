package com.proyectopresupuesto.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CurrentUser implements UserDetails {

    private final Long id;
    private final String email;
    private final boolean accesoDesbloqueado;

    public CurrentUser(Long id, String email, boolean accesoDesbloqueado) {
        this.id = id;
        this.email = email;
        this.accesoDesbloqueado = accesoDesbloqueado;
    }

    public Long getId() { return id; }
    public boolean isAccesoDesbloqueado() { return accesoDesbloqueado; }

    @Override public String getUsername() { return email; }
    @Override public String getPassword() { return null; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
