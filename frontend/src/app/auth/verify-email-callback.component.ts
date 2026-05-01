import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-verify-email-callback',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-bg">
      <div class="callback-card">

        @if (state === 'loading') {
          <mat-spinner diameter="48" style="margin:0 auto 24px"></mat-spinner>
          <p style="color:#9E9E9E;text-align:center">Verificando tu email...</p>
        }

        @if (state === 'success') {
          <div class="icon-wrap success">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h1>¡Email verificado!</h1>
          <p style="color:#9E9E9E;text-align:center;margin:0 0 32px">
            Tu cuenta está activa. Ya podés ingresar.
          </p>
          <a mat-raised-button color="primary" style="width:100%" routerLink="/auth" [queryParams]="{mode:'login', verified:'true'}">
            Ir al login
          </a>
        }

        @if (state === 'error') {
          <div class="icon-wrap error">
            <mat-icon>cancel</mat-icon>
          </div>
          <h1>Link inválido</h1>
          <p style="color:#9E9E9E;text-align:center;margin:0 0 32px">
            {{ errorMsg }}
          </p>
          <a mat-raised-button color="primary" style="width:100%" routerLink="/auth">
            Ir al login
          </a>
        }

      </div>
    </div>
  `,
  styles: [`
    .callback-bg {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px; background: #121212;
    }
    .callback-card {
      width: 100%; max-width: 400px;
      background: #1E1E1E; border: 1px solid #333;
      border-radius: 16px; padding: 48px 36px;
      text-align: center;
    }
    .icon-wrap {
      width: 72px; height: 72px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      mat-icon { font-size: 36px; height: 36px; width: 36px; }
      &.success { background: rgba(76,175,80,0.12); mat-icon { color: #4CAF50; } }
      &.error   { background: rgba(244,67,54,0.1);  mat-icon { color: #ef5350; } }
    }
    h1 { margin: 0 0 12px; font-size: 1.5rem; font-weight: 700; }
  `]
})
export class VerifyEmailCallbackComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  state: 'loading' | 'success' | 'error' = 'loading';
  errorMsg = '';

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      this.errorMsg = 'No se encontró el token de verificación.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => { this.state = 'success'; },
      error: (err: any) => {
        this.state = 'error';
        const code = err?.error?.error;
        this.errorMsg = code === 'TOKEN_EXPIRED'
          ? 'El link expiró. Pedí uno nuevo desde el login.'
          : 'El link no es válido o ya fue usado.';
      }
    });
  }
}
