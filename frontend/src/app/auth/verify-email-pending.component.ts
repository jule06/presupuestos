import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-verify-email-pending',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="pending-bg">
      <div class="pending-card">
        <div class="icon-wrap">
          <mat-icon>mark_email_unread</mat-icon>
        </div>

        <h1>Revisá tu email</h1>
        <p class="subtitle">
          Te mandamos un link de verificación a<br>
          <strong>{{ email }}</strong>
        </p>
        <p class="hint">
          Hacé click en el link del email para activar tu cuenta.
          Si no lo ves, revisá la carpeta de spam.
        </p>

        <div class="actions">
          @if (!sent) {
            <button mat-raised-button color="primary" (click)="resend()" [disabled]="cooldown > 0">
              @if (cooldown > 0) { Reenviar en {{ cooldown }}s }
              @else { Reenviar email }
            </button>
          } @else {
            <div class="sent-msg">
              <mat-icon>check_circle</mat-icon>
              Email reenviado
            </div>
          }

          <a mat-button routerLink="/auth" style="color:#9E9E9E">Volver al login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-bg {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px; background: #121212;
    }
    .pending-card {
      width: 100%; max-width: 440px;
      background: #1E1E1E; border: 1px solid #333;
      border-radius: 16px; padding: 48px 36px;
      text-align: center;
    }
    .icon-wrap {
      width: 72px; height: 72px;
      background: rgba(76,175,80,0.12); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      mat-icon { color: #4CAF50; font-size: 36px; height: 36px; width: 36px; }
    }
    h1 { margin: 0 0 12px; font-size: 1.5rem; font-weight: 700; }
    .subtitle { color: #E0E0E0; margin: 0 0 12px; line-height: 1.6; strong { color: #4CAF50; } }
    .hint { color: #9E9E9E; font-size: 0.875rem; margin: 0 0 32px; line-height: 1.5; }
    .actions { display: flex; flex-direction: column; gap: 12px; align-items: center; }
    .sent-msg {
      display: flex; align-items: center; gap: 8px;
      color: #4CAF50; font-size: 0.875rem;
      mat-icon { font-size: 18px; height: 18px; width: 18px; }
    }
  `]
})
export class VerifyEmailPendingComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  email = '';
  cooldown = 0;
  sent = false;
  private interval: any;

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.email = p['email'] ?? '';
    });
  }

  resend() {
    if (!this.email || this.cooldown > 0) return;
    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        this.sent = true;
        this.startCooldown();
      },
      error: () => {
        this.sent = true;
        this.startCooldown();
      }
    });
  }

  private startCooldown() {
    this.cooldown = 60;
    this.interval = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        clearInterval(this.interval);
        this.sent = false;
      }
    }, 1000);
  }
}
