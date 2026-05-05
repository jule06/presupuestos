import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar class="navbar">
      <div class="nav-container">

        <a routerLink="/" class="logo-link">
          <mat-icon style="color:#4CAF50;">architecture</mat-icon>
          <span class="logo-text">Proyecto Presupuesto</span>
        </a>

        <span class="flex-spacer"></span>

        @if (auth.isLoggedIn()) {
          <a mat-button routerLink="/explorador" class="desktop-link" style="color:#9E9E9E;">
            <mat-icon>search</mat-icon> Explorador
          </a>
          <a mat-button routerLink="/cargar" class="desktop-link" style="color:#4CAF50; font-weight:600;">
            <mat-icon>add</mat-icon> Cargar
          </a>
          <button mat-icon-button [matMenuTriggerFor]="menu" class="avatar-btn">
            @if (auth.currentUser()?.fotoUrl) {
              <img [src]="auth.currentUser()!.fotoUrl!" alt="" class="avatar-img">
            } @else {
              <span class="avatar-initials">{{ initials() }}</span>
            }
            @if (!auth.currentUser()?.perfilCompleto && auth.currentUser() !== null) {
              <span class="perfil-dot" title="Completá tu perfil"></span>
            }
          </button>
          <mat-menu #menu="matMenu">
            <a mat-menu-item routerLink="/perfil">
              <mat-icon>person</mat-icon> Mi perfil
            </a>
            <a mat-menu-item routerLink="/explorador">
              <mat-icon>search</mat-icon> Explorador
            </a>
            <a mat-menu-item routerLink="/cargar">
              <mat-icon>add</mat-icon> Cargar presupuesto
            </a>
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Salir
            </button>
          </mat-menu>
        } @else {
          <a mat-button routerLink="/auth" class="desktop-link" style="color:#9E9E9E;">Iniciar sesión</a>
          <a mat-raised-button color="primary" routerLink="/auth" class="desktop-link" [queryParams]="{mode:'register'}">
            Registrarme
          </a>
          <a mat-button routerLink="/auth" class="mobile-link" style="color:#9E9E9E; font-size:0.9rem;">
            Acceder
          </a>
        }

      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: #1A1A1A;
      border-bottom: 1px solid #333;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 8px;
    }

    .logo-link {
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex-shrink: 1;
    }

    .logo-text {
      font-weight: 700;
      font-size: 1.1rem;
      color: #fff;
      letter-spacing: -0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .flex-spacer { flex: 1; min-width: 8px; }

    .avatar-btn { position: relative; }

    .avatar-img {
      width: 32px; height: 32px; border-radius: 50%; object-fit: cover;
    }

    .avatar-initials {
      width: 32px; height: 32px; border-radius: 50%;
      background: #2E7D32; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
    }

    .perfil-dot {
      position: absolute;
      top: 4px; right: 4px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #f44336;
      border: 2px solid #1A1A1A;
      pointer-events: none;
    }

    @media (max-width: 599px) {
      .desktop-link { display: none !important; }
      .logo-text { font-size: 0.9rem; max-width: 150px; }
    }

    @media (max-width: 380px) {
      .logo-text { max-width: 110px; }
    }

    @media (min-width: 600px) {
      .mobile-link { display: none !important; }
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return ((u.nombre?.[0] ?? '') + (u.apellido?.[0] ?? '')).toUpperCase() || '?';
  }
}
