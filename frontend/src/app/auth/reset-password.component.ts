import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './auth.service';

function passwordMatchValidator(c: AbstractControl): ValidationErrors | null {
  return c.get('newPassword')?.value === c.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink
  ],
  template: `
    <div class="reset-bg">
      <div class="reset-card">

        @if (!token) {
          <div class="icon-wrap error"><mat-icon>cancel</mat-icon></div>
          <h1>Link inválido</h1>
          <p style="color:#9E9E9E;text-align:center;margin:0 0 24px">No se encontró el token de reset.</p>
          <a mat-raised-button color="primary" style="width:100%" routerLink="/auth">Ir al login</a>
        }

        @if (token && state === 'form') {
          <div class="icon-wrap"><mat-icon>lock_reset</mat-icon></div>
          <h1>Nueva contraseña</h1>

          <form [formGroup]="form" (ngSubmit)="submit()" class="reset-form">
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Nueva contraseña</mat-label>
              <input matInput [type]="showPass ? 'text' : 'password'" formControlName="newPassword" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="showPass = !showPass" tabindex="-1">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('newPassword')?.touched && form.get('newPassword')?.hasError('minlength')) {
                <mat-hint style="color:#f44336">Mínimo 6 caracteres</mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput [type]="showConfirm ? 'text' : 'password'" formControlName="confirm" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="showConfirm = !showConfirm" tabindex="-1">
                <mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.touched && form.hasError('mismatch')) {
                <mat-hint style="color:#f44336">Las contraseñas no coinciden</mat-hint>
              }
            </mat-form-field>

            @if (errorMsg) { <div class="field-error">{{ errorMsg }}</div> }

            <button mat-raised-button color="primary" type="submit" style="width:100%;height:44px"
                    [disabled]="loading || form.invalid">
              @if (loading) { <mat-spinner diameter="20" style="display:inline-block"></mat-spinner> }
              @else { Guardar contraseña }
            </button>
          </form>
        }

        @if (state === 'success') {
          <div class="icon-wrap success"><mat-icon>check_circle</mat-icon></div>
          <h1>Contraseña actualizada</h1>
          <p style="color:#9E9E9E;text-align:center;margin:0 0 32px">Ya podés ingresar con tu nueva contraseña.</p>
          <a mat-raised-button color="primary" style="width:100%" routerLink="/auth">Ir al login</a>
        }

        @if (state === 'error') {
          <div class="icon-wrap error"><mat-icon>cancel</mat-icon></div>
          <h1>Link inválido</h1>
          <p style="color:#9E9E9E;text-align:center;margin:0 0 32px">{{ errorMsg }}</p>
          <a mat-raised-button color="primary" style="width:100%" routerLink="/auth" [queryParams]="{mode:'forgot-password'}">
            Pedir nuevo link
          </a>
        }

      </div>
    </div>
  `,
  styles: [`
    .reset-bg {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px; background: #121212;
    }
    .reset-card {
      width: 100%; max-width: 400px;
      background: #1E1E1E; border: 1px solid #333;
      border-radius: 16px; padding: 48px 36px;
      text-align: center;
    }
    .icon-wrap {
      width: 72px; height: 72px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      background: rgba(76,175,80,0.12);
      mat-icon { color: #4CAF50; font-size: 36px; height: 36px; width: 36px; }
      &.success { background: rgba(76,175,80,0.12); mat-icon { color: #4CAF50; } }
      &.error   { background: rgba(244,67,54,0.1);  mat-icon { color: #ef5350; } }
    }
    h1 { margin: 0 0 24px; font-size: 1.5rem; font-weight: 700; }
    .reset-form { display: flex; flex-direction: column; gap: 4px; text-align: left; }
    .field-error {
      color: #ef5350; font-size: 0.8rem; padding: 8px 12px;
      background: rgba(244,67,54,0.08); border-radius: 6px;
      border-left: 3px solid #ef5350;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  token = '';
  state: 'form' | 'success' | 'error' = 'form';
  loading = false;
  showPass = false;
  showConfirm = false;
  errorMsg = '';

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit() {
    if (this.form.invalid || !this.token) return;
    this.loading = true;
    this.errorMsg = '';
    this.authService.resetPassword(this.token, this.form.value.newPassword!).subscribe({
      next: () => { this.loading = false; this.state = 'success'; },
      error: (err: any) => {
        this.loading = false;
        const code = err?.error?.error;
        if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
          this.state = 'error';
          this.errorMsg = code === 'TOKEN_EXPIRED'
            ? 'El link expiró. Pedí uno nuevo.'
            : 'El link no es válido o ya fue usado.';
        } else {
          this.errorMsg = 'Ocurrió un error. Intentá de nuevo.';
        }
      }
    });
  }
}
