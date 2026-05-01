package com.proyectopresupuesto.usuario;

public record ContactoPublicoDTO(
    String nombre,
    String apellido,
    String ciudad,
    String provincia,
    String whatsapp,
    String linkedinUrl,
    String instagramUrl,
    String behanceUrl,
    String pinterestUrl,
    String sitioWeb,
    String bio
) {
    public static ContactoPublicoDTO from(Usuario u) {
        return new ContactoPublicoDTO(
            u.getNombre(), u.getApellido(),
            u.getCiudad(), u.getProvincia(),
            u.getWhatsapp(), u.getLinkedinUrl(),
            u.getInstagramUrl(), u.getBehanceUrl(),
            u.getPinterestUrl(), u.getSitioWeb(),
            u.getBio()
        );
    }
}
