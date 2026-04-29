import { Component, AfterViewInit, ElementRef, ViewChild, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar style="background: #1A1A1A; border-bottom: 1px solid #333; position: sticky; top: 0; z-index: 100;">
      <div class="container" style="display:flex; align-items:center; width:100%; gap:16px;">

        <a routerLink="/" style="text-decoration:none; display:flex; align-items:center; gap:8px;">
          <mat-icon style="color: #4CAF50;">architecture</mat-icon>
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
          <button mat-icon-button [matMenuTriggerFor]="menu">
            @if (auth.currentUser()?.fotoUrl) {
              <img [src]="auth.currentUser()!.fotoUrl!" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            } @else {
              <mat-icon>account_circle</mat-icon>
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
          <div #googleBtn></div>
        }

      </div>
    </mat-toolbar>
  `
})
export class NavbarComponent implements AfterViewInit {

  @ViewChild('googleBtn') googleBtn!: ElementRef;

  constructor(public auth: AuthService, private router: Router) {
    effect(() => {
      if (!auth.isLoggedIn()) {
        // Wait one tick for @if to render the #googleBtn div in the DOM
        setTimeout(() => this.initGoogleButton(), 0);
      }
    });
  }

  ngAfterViewInit() {
    if (!this.auth.isLoggedIn()) {
      this.initGoogleButton();
    }
  }

  private initGoogleButton() {
    if (typeof google !== 'undefined') {
      this.renderButton();
    } else {
      const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => this.renderButton();
        document.head.appendChild(script);
      } else {
        existing.addEventListener('load', () => this.renderButton());
      }
    }
  }

  private renderButton() {
    if (!this.googleBtn?.nativeElement) return;

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleResponse(response)
    });

    google.accounts.id.renderButton(this.googleBtn.nativeElement, {
      theme: 'filled_black',
      size: 'medium',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }

  private handleGoogleResponse(response: any) {
    this.auth.loginWithGoogle(response.credential).subscribe({
      next: (res: any) => {
        this.auth.loadCurrentUser().subscribe(() => {
          if (res.esNuevo || !res.accesoDesbloqueado) {
            this.router.navigate(['/cargar']);
          } else {
            this.router.navigate(['/explorador']);
          }
        });
      },
      error: () => alert('Error al iniciar sesión con Google. Intentá de nuevo.')
    });
  }
}
