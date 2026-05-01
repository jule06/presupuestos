package com.proyectopresupuesto.auth;

public class AuthException extends RuntimeException {
    public AuthException(String code) {
        super(code);
    }
}
