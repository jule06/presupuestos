import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

declare const google: any;

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pass = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
}

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: 'Este email ya está registrado.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
  EMAIL_NOT_VERIFIED: 'Verificá tu email antes de continuar. Revisá tu bandeja de entrada.',
  USE_GOOGLE: 'Esta cuenta fue creada con Google. Usá el botón "Continuar con Google".',
  INVALID_TOKEN: 'El link no es válido o ya fue usado.',
  TOKEN_EXPIRED: 'El link expiró. Solicitá uno nuevo.',
  MAIL_ERROR: 'No se pudo enviar el email de verificación. Configurá las credenciales de mail.',
};

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-bg">
      <div class="auth-card">

        <!-- Header -->
        <div class="auth-header">
          <mat-icon style="color:#4CAF50;font-size:2rem;height:2rem;width:2rem;">architecture</mat-icon>
          <h1>Proyecto Presupuesto</h1>
          <p>La base de datos de presupuestos para arquitectos</p>
        </div>

        <!-- Verified banner -->
        @if (verifiedBanner) {
          <div class="banner-success">
            <mat-icon>check_circle</mat-icon>
            ¡Email verificado! Ya podés ingresar.
          </div>
        }

        <!-- Error banner -->
        @if (globalError) {
          <div class="banner-error">
            <mat-icon>error</mat-icon>
            {{ globalError }}
          </div>
        }

        <!-- Mode pills -->
        <div class="pills">
          <button class="pill" [class.active]="mode === 'login'" (click)="setMode('login')">
            Acceder
          </button>
          <button class="pill" [class.active]="mode === 'register'" (click)="setMode('register')">
            Registrarme
          </button>
        </div>

        <!-- Google button (hidden in forgot-password mode) -->
        @if (mode !== 'forgot-password') {
          <button class="google-signin-btn" type="button" (click)="signInWithGoogle()" [disabled]="loading">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>
          <div class="separator"><span>o</span></div>
        }

        <!-- LOGIN FORM -->
        @if (mode === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="auth-form">
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="showPass ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="showPass = !showPass" tabindex="-1">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (formError) { <div class="field-error">{{ formError }}</div> }

            <button mat-raised-button color="primary" type="submit" style="width:100%;height:44px"
                    [disabled]="loading || loginForm.invalid">
              @if (loading) { <mat-spinner diameter="20" style="display:inline-block"></mat-spinner> }
              @else { Ingresar }
            </button>

            <button mat-button type="button" class="forgot-link" (click)="setMode('forgot-password')">
              Olvidé mi contraseña
            </button>
          </form>
        }

        <!-- REGISTER FORM -->
        @if (mode === 'register') {
          <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" class="auth-form">
            <div class="form-row">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" autocomplete="given-name">
              </mat-form-field>
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="apellido" autocomplete="family-name">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="showPass ? 'text' : 'password'" formControlName="password" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="showPass = !showPass" tabindex="-1">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.hasError('minlength')) {
                <mat-hint style="color:#f44336">Mínimo 6 caracteres</mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput [type]="showConfirm ? 'text' : 'password'" formControlName="confirmPassword" autocomplete="new-password">
              <button mat-icon-button matSuffix type="button" (click)="showConfirm = !showConfirm" tabindex="-1">
                <mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.touched && registerForm.hasError('passwordMismatch')) {
                <mat-hint style="color:#f44336">Las contraseñas no coinciden</mat-hint>
              }
            </mat-form-field>

            @if (formError) { <div class="field-error">{{ formError }}</div> }

            <button mat-raised-button color="primary" type="submit" style="width:100%;height:44px"
                    [disabled]="loading || registerForm.invalid">
              @if (loading) { <mat-spinner diameter="20" style="display:inline-block"></mat-spinner> }
              @else { Crear cuenta }
            </button>
          </form>
        }

        <!-- FORGOT PASSWORD -->
        @if (mode === 'forgot-password') {
          <form [formGroup]="forgotForm" (ngSubmit)="submitForgot()" class="auth-form">
            <p style="color:#9E9E9E;margin:0 0 20px;text-align:center">
              Ingresá tu email y te enviamos un link para resetear tu contraseña.
            </p>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
            </mat-form-field>

            @if (formError) { <div class="field-error">{{ formError }}</div> }
            @if (forgotSuccess) {
              <div class="banner-success" style="margin:0 0 16px">
                <mat-icon>mail</mat-icon>
                Te mandamos el link a {{ forgotForm.value.email }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit" style="width:100%;height:44px"
                    [disabled]="loading || forgotForm.invalid || forgotSuccess">
              @if (loading) { <mat-spinner diameter="20" style="display:inline-block"></mat-spinner> }
              @else { Enviar link }
            </button>

            <button mat-button type="button" class="forgot-link" (click)="setMode('login')">
              <mat-icon>arrow_back</mat-icon> Volver al login
            </button>
          </form>
        }

      </div>
    </div>
  `,
  styles: [`
    .auth-bg {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #121212;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #1E1E1E;
      border: 1px solid #333;
      border-radius: 16px;
      padding: 40px 36px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 28px;
      mat-icon { display: block; margin: 0 auto 12px; }
      h1 { margin: 0 0 6px; font-size: 1.4rem; font-weight: 700; }
      p  { margin: 0; color: #9E9E9E; font-size: 0.875rem; }
    }

    .banner-success {
      display: flex; align-items: center; gap: 8px;
      background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.3);
      color: #4CAF50; border-radius: 8px; padding: 12px 14px;
      font-size: 0.875rem; margin-bottom: 20px;
      mat-icon { font-size: 18px; height: 18px; width: 18px; flex-shrink: 0; }
    }

    .banner-error {
      display: flex; align-items: center; gap: 8px;
      background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.3);
      color: #ef5350; border-radius: 8px; padding: 12px 14px;
      font-size: 0.875rem; margin-bottom: 20px;
      mat-icon { font-size: 18px; height: 18px; width: 18px; flex-shrink: 0; }
    }

    .pills {
      display: flex;
      gap: 8px;
      background: #2A2A2A;
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 24px;
    }

    .pill {
      flex: 1;
      padding: 8px 16px;
      border-radius: 7px;
      border: none;
      background: transparent;
      color: #9E9E9E;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;

      &.active {
        background: #333;
        color: #E0E0E0;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      }

      &:hover:not(.active) { color: #E0E0E0; }
    }

    .google-signin-btn {
      width: 100%;
      height: 44px;
      background: #fff;
      color: #3c4043;
      border: 1px solid #dadce0;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      margin-bottom: 16px;
      transition: background 0.15s, box-shadow 0.15s;

      &:hover:not(:disabled) {
        background: #f8f9fa;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }

    .separator {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      color: #555;
      font-size: 0.8rem;
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #333;
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

    .form-row { display: flex; gap: 12px; }

    .field-error {
      color: #ef5350;
      font-size: 0.8rem;
      margin: -2px 0 8px;
      padding: 8px 12px;
      background: rgba(244,67,54,0.08);
      border-radius: 6px;
      border-left: 3px solid #ef5350;
    }

    .forgot-link {
      color: #9E9E9E;
      font-size: 0.85rem;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: center;
    }

    @media (max-width: 480px) {
      .auth-card { padding: 28px 20px; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class AuthPageComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(AuthService);

  mode: 'login' | 'register' | 'forgot-password' = 'login';
  loading = false;
  showPass = false;
  showConfirm = false;
  formError = '';
  globalError = '';
  verifiedBanner = false;
  forgotSuccess = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/explorador']);
      return;
    }
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') this.mode = 'register';
      if (params['verified'] === 'true') this.verifiedBanner = true;
    });
    this.loadGoogleSDK();
  }

  setMode(m: typeof this.mode) {
    this.mode = m;
    this.formError = '';
    this.forgotSuccess = false;
    this.router.navigate([], {
      queryParams: { mode: m === 'login' ? null : m },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private loadGoogleSDK() {
    const init = () => {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (r: any) => this.handleGoogleResponse(r),
        ux_mode: 'popup',
        cancel_on_tap_outside: true,
      });
    };
    if (typeof google !== 'undefined') { init(); return; }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload = init;
      document.head.appendChild(s);
    }
  }

  signInWithGoogle() {
    if (typeof google === 'undefined') return;
    google.accounts.id.prompt((n: any) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        this.globalError = 'No se pudo abrir Google. Asegurate de tener una cuenta de Google activa en tu navegador.';
      }
    });
  }

  private handleGoogleResponse(response: any) {
    this.loading = true;
    this.auth.loginWithGoogle(response.credential).subscribe({
      next: (res: any) => {
        this.auth.loadCurrentUser().subscribe(() => {
          this.loading = false;
          if (res.esNuevo || !res.accesoDesbloqueado) {
            this.router.navigate(['/cargar']);
          } else {
            this.router.navigate(['/explorador']);
          }
        });
      },
      error: () => {
        this.loading = false;
        this.globalError = 'Error al iniciar sesión con Google. Intentá de nuevo.';
      }
    });
  }

  submitLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.formError = '';
    const { email, password } = this.loginForm.value;
    this.auth.loginLocal(email!, password!).subscribe({
      next: (res: any) => {
        this.auth.loadCurrentUser().subscribe(() => {
          this.loading = false;
          if (res.esNuevo || !res.accesoDesbloqueado) {
            this.router.navigate(['/cargar']);
          } else {
            this.router.navigate(['/explorador']);
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        const code = err?.error?.error;
        this.formError = ERROR_MESSAGES[code] ?? 'Ocurrió un error. Intentá de nuevo.';
      }
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.formError = '';
    const { nombre, apellido, email, password } = this.registerForm.value;
    this.auth.register({ nombre: nombre!, apellido: apellido!, email: email!, password: password! }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.verificationRequired) {
          this.router.navigate(['/auth/verify-pending'], { queryParams: { email } });
        } else {
          this.setMode('login');
          this.verifiedBanner = true;
        }
      },
      error: (err: any) => {
        this.loading = false;
        const code = err?.error?.error;
        this.formError = ERROR_MESSAGES[code] ?? 'Ocurrió un error. Intentá de nuevo.';
      }
    });
  }

  submitForgot() {
    if (this.forgotForm.invalid) return;
    this.loading = true;
    this.formError = '';
    this.auth.forgotPassword(this.forgotForm.value.email!).subscribe({
      next: () => {
        this.loading = false;
        this.forgotSuccess = true;
      },
      error: () => {
        this.loading = false;
        this.forgotSuccess = true; // no revelar si el email existe
      }
    });
  }
}
