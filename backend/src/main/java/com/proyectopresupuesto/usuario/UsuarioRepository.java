package com.proyectopresupuesto.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByGoogleId(String googleId);
    Optional<Usuario> findByVerificationToken(String token);
    Optional<Usuario> findByResetPasswordToken(String token);
    boolean existsByEmail(String email);
    long count();

    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.presupuestosCargados = 0")
    void resetPresupuestosCargados();
}
