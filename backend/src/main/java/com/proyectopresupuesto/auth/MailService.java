package com.proyectopresupuesto.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String nombre, String token) {
        String link = frontendUrl + "/auth/verify-email?token=" + token;
        String html = """
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#121212;color:#E0E0E0;padding:40px;margin:0">
              <div style="max-width:500px;margin:0 auto;background:#1E1E1E;border-radius:12px;padding:40px;border:1px solid #333">
                <h2 style="color:#4CAF50;margin-top:0">Verificá tu cuenta</h2>
                <p>Hola <strong>%s</strong>,</p>
                <p>Hacé click en el botón para verificar tu email y comenzar a usar Proyecto Presupuesto:</p>
                <a href="%s" style="display:inline-block;background:#2E7D32;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                  Verificar mi email
                </a>
                <p style="color:#9E9E9E;font-size:0.85rem;margin-top:24px">
                  Este link expira en 24 horas. Si no creaste una cuenta, ignorá este email.
                </p>
              </div>
            </body>
            </html>
            """.formatted(nombre, link);
        sendHtml(to, "Verificá tu cuenta en Proyecto Presupuesto", html);
    }

    public void sendPasswordResetEmail(String to, String nombre, String token) {
        String link = frontendUrl + "/auth/reset-password?token=" + token;
        String html = """
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#121212;color:#E0E0E0;padding:40px;margin:0">
              <div style="max-width:500px;margin:0 auto;background:#1E1E1E;border-radius:12px;padding:40px;border:1px solid #333">
                <h2 style="color:#4CAF50;margin-top:0">Resetear contraseña</h2>
                <p>Hola <strong>%s</strong>,</p>
                <p>Recibimos una solicitud para resetear tu contraseña:</p>
                <a href="%s" style="display:inline-block;background:#2E7D32;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                  Resetear contraseña
                </a>
                <p style="color:#9E9E9E;font-size:0.85rem;margin-top:24px">
                  Este link expira en 1 hora. Si no pediste resetear tu contraseña, ignorá este email.
                </p>
              </div>
            </body>
            </html>
            """.formatted(nombre, link);
        sendHtml(to, "Resetear contraseña - Proyecto Presupuesto", html);
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar email", e);
        }
    }
}
