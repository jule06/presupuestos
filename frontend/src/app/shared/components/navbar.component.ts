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
    <mat-toolbar style="background:#1A1A1A; border-bottom:1px solid #333; position:sticky; top:0; z-index:100;">
      <div class="container" style="display:flex; align-items:center; width:100%; gap:16px;">

        <a routerLink="/" style="text-decoration:none; display:flex; align-items:center; gap:8px;">
          <mat-icon style="color:#4CAF50;">architecture</mat-icon>
          <span style="font-weight:700; font-size:1.1rem; color:#fff; letter-spacing:-0.5px;">Proyecto Presupuesto</span>
        </a>

        <span style="flex:1"></span>

        @if (auth.isLoggedIn()) {
          <a mat-button routerLink="/explorador" style="color:#9E9E9E;">
            <mat-icon>search</mat-icon> Explorador
          </a>
          <a mat-button routerLink="/cargar" style="color:#4CAF50; font-weight:600;">
            <mat-icon>add</mat-icon> Cargar
          </a>
          <button mat-icon-button [matMenuTriggerFor]="menu" style="position:relative;">
            @if (auth.currentUser()?.fotoUrl) {
              <img [src]="auth.currentUser()!.fotoUrl!" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            } @else {
              <span style="width:32px;height:32px;border-radius:50%;background:#2E7D32;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;letter-spacing:0.5px;">
                {{ initials() }}
              </span>
            }
            @if (!auth.currentUser()?.perfilCompleto && auth.currentUser() !== null) {
              <span class="perfil-dot" title="Completá tu perfil"></span>
            }
          </button>
          <mat-menu #menu="matMenu">
            <a mat-menu-item routerLink="/perfil">
              <mat-icon>person</mat-icon> Mi perfil
            </a>
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Salir
            </button>
          </mat-menu>
        } @else {
          <a mat-button routerLink="/auth" style="color:#9E9E9E;">Iniciar sesión</a>
          <a mat-raised-button color="primary" routerLink="/auth" [queryParams]="{mode:'register'}">
            Registrarme
          </a>
        }

      </div>
    </mat-toolbar>
  `,
  styles: [`
    .perfil-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #f44336;
      border: 2px solid #1A1A1A;
      pointer-events: none;
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
