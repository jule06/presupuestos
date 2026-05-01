import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../auth/auth.service';
import { Presupuesto, TIPO_OBRA_LABELS, CATEGORIA_LABELS } from '../shared/models/presupuesto.model';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán'
];

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatChipsModule, MatDialogModule
  ],
  template: `
    <div class="container" style="padding: 40px 24px; max-width: 900px;">

      <!-- Header -->
      <div class="perfil-header">
        <div class="avatar">
          @if (auth.currentUser()?.fotoUrl) {
            <img [src]="auth.currentUser()!.fotoUrl!" alt="foto">
          } @else {
            <mat-icon style="font-size:48px;height:48px;width:48px;">account_circle</mat-icon>
          }
        </div>
        <div>
          <h1 style="margin:0 0 4px; font-size:1.5rem; font-weight:700;">
            {{ auth.currentUser()?.nombre }} {{ auth.currentUser()?.apellido }}
          </h1>
          <div style="color:#9E9E9E; font-size:0.9rem;">{{ auth.currentUser()?.email }}</div>
          @if (auth.currentUser()?.accesoDesbloqueado) {
            <div class="badge-acceso">
              <mat-icon style="font-size:14px;height:14px;width:14px;">lock_open</mat-icon>
              Acceso desbloqueado
            </div>
          } @else {
            <div class="badge-sin-acceso">
              <mat-icon style="font-size:14px;height:14px;width:14px;">lock</mat-icon>
              Sin acceso — cargá un presupuesto
            </div>
          }
        </div>
      </div>

      <!-- Stats -->
      <div class="perfil-stats">
        <div class="stat-item">
          <span class="stat-number">{{ auth.currentUser()?.presupuestosCargados ?? 0 }}</span>
          <span class="stat-label">Presupuestos cargados</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" [style.color]="auth.currentUser()?.accesoDesbloqueado ? '#4CAF50' : '#f44336'">
            {{ auth.currentUser()?.accesoDesbloqueado ? '✓' : '✗' }}
          </span>
          <span class="stat-label">Acceso al explorador</span>
        </div>
      </div>

      <div style="margin: 24px 0;">
        <a mat-raised-button color="primary" routerLink="/cargar">
          <mat-icon>add</mat-icon> Cargar otro presupuesto
        </a>
      </div>

      <!-- Status banner perfilCompleto -->
      @if (perfilCompleto) {
        <div class="banner-success">
          <mat-icon>check_circle</mat-icon>
          Tu perfil está listo para aparecer como contacto en tus presupuestos
        </div>
      } @else {
        <div class="banner-warning">
          <mat-icon>warning</mat-icon>
          Completá al menos una red o sitio web para poder aparecer como contacto en tus presupuestos
        </div>
      }

      <!-- SECTION: Mis datos -->
      <mat-card class="form-card" style="margin-top: 32px;">
        <mat-card-header>
          <mat-card-title style="font-size:1.1rem; font-weight:600;">Mis datos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" style="padding-top: 16px;">

            <div class="form-row">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre">
                @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="apellido">
                @if (form.get('apellido')?.hasError('required') && form.get('apellido')?.touched) {
                  <mat-error>El apellido es requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Teléfono</mat-label>
                <mat-icon matPrefix style="font-size:18px;margin-right:4px;">phone</mat-icon>
                <input matInput formControlName="telefono" placeholder="Ej: 1155667788">
              </mat-form-field>
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>WhatsApp</mat-label>
                <mat-icon matPrefix style="font-size:18px;margin-right:4px;">chat</mat-icon>
                <input matInput formControlName="whatsapp" placeholder="Solo números, ej: 5491155667788">
                @if (form.get('whatsapp')?.hasError('pattern') && form.get('whatsapp')?.touched) {
                  <mat-error>Solo números, entre 10 y 15 dígitos</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Dirección</mat-label>
              <mat-icon matPrefix style="font-size:18px;margin-right:4px;">home</mat-icon>
              <input matInput formControlName="direccion" placeholder="Ej: Av. Corrientes 1234">
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Ciudad</mat-label>
                <input matInput formControlName="ciudad" placeholder="Ej: Rosario">
              </mat-form-field>
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Provincia</mat-label>
                <mat-select formControlName="provincia">
                  @for (prov of provincias; track prov) {
                    <mat-option [value]="prov">{{ prov }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="3"
                        placeholder="Contá brevemente quién sos, tu especialidad..."></textarea>
              <mat-hint align="end">{{ bioCount }}/300</mat-hint>
              @if (form.get('bio')?.hasError('maxlength')) {
                <mat-error>Máximo 300 caracteres</mat-error>
              }
            </mat-form-field>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- SECTION: Presencia online -->
      <mat-card class="form-card" style="margin-top: 24px;">
        <mat-card-header>
          <mat-card-title style="font-size:1.1rem; font-weight:600;">Tu presencia online</mat-card-title>
          <mat-card-subtitle style="color:#9E9E9E; font-size:0.85rem; margin-top:4px;">
            Completá al menos una para poder aparecer como contacto en tus presupuestos
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" style="padding-top: 16px;">

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>LinkedIn</mat-label>
              <mat-icon matPrefix style="color:#0A66C2;font-size:18px;margin-right:4px;">link</mat-icon>
              <input matInput formControlName="linkedinUrl" placeholder="https://linkedin.com/in/tu-perfil">
              @if (linkedinPreview) {
                <mat-hint>
                  <a [href]="linkedinPreview" target="_blank" style="color:#4CAF50;">{{ linkedinPreview }}</a>
                </mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Instagram</mat-label>
              <mat-icon matPrefix style="color:#E1306C;font-size:18px;margin-right:4px;">photo_camera</mat-icon>
              <input matInput formControlName="instagramUrl" placeholder="https://instagram.com/tu_usuario">
              @if (instagramPreview) {
                <mat-hint>
                  <a [href]="instagramPreview" target="_blank" style="color:#4CAF50;">{{ instagramPreview }}</a>
                </mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Behance</mat-label>
              <mat-icon matPrefix style="color:#1769ff;font-size:18px;margin-right:4px;">brush</mat-icon>
              <input matInput formControlName="behanceUrl" placeholder="https://behance.net/tu_perfil">
              @if (behancePreview) {
                <mat-hint>
                  <a [href]="behancePreview" target="_blank" style="color:#4CAF50;">{{ behancePreview }}</a>
                </mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Pinterest</mat-label>
              <mat-icon matPrefix style="color:#E60023;font-size:18px;margin-right:4px;">push_pin</mat-icon>
              <input matInput formControlName="pinterestUrl" placeholder="https://pinterest.com/tu_perfil">
              @if (pinterestPreview) {
                <mat-hint>
                  <a [href]="pinterestPreview" target="_blank" style="color:#4CAF50;">{{ pinterestPreview }}</a>
                </mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Sitio web</mat-label>
              <mat-icon matPrefix style="font-size:18px;margin-right:4px;">language</mat-icon>
              <input matInput formControlName="sitioWeb" placeholder="https://tu-sitio.com">
              @if (sitioWebPreview) {
                <mat-hint>
                  <a [href]="sitioWebPreview" target="_blank" style="color:#4CAF50;">{{ sitioWebPreview }}</a>
                </mat-hint>
              }
            </mat-form-field>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- Save button -->
      <div style="margin-top: 24px; display:flex; gap:16px; align-items:center;">
        <button mat-raised-button color="primary"
                [disabled]="form.invalid || saving"
                (click)="guardar()"
                style="min-width:160px;">
          @if (saving) {
            <mat-spinner diameter="20" style="display:inline-block;margin-right:8px;"></mat-spinner>
          } @else {
            <mat-icon>save</mat-icon>
          }
          {{ saving ? 'Guardando...' : 'Guardar perfil' }}
        </button>
      </div>

      <!-- Mis presupuestos -->
      <h2 style="font-size:1.1rem; font-weight:600; margin: 48px 0 16px;">
        Mis presupuestos cargados
      </h2>

      @if (loadingPresupuestos()) {
        <div style="color:#9E9E9E;">Cargando...</div>
      } @else if (misPresupuestos().length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Todavía no cargaste ningún presupuesto.</p>
          <a mat-button color="primary" routerLink="/cargar">Cargar ahora</a>
        </div>
      } @else {
        <div class="presupuestos-list">
          @for (p of misPresupuestos(); track p.id) {
            <div class="rp-card presupuesto-row">
              <div class="row-main">
                <div>
                  <span class="chip-tipo">{{ tipoLabel(p.tipoObra) }}</span>
                  <span [class]="'chip-categoria ' + p.categoriaTerminacion" style="margin-left:8px;">
                    {{ catLabel(p.categoriaTerminacion) }}
                  </span>
                  @if (p.anonimo === false) {
                    <span class="badge-visible" style="margin-left:8px;">
                      <mat-icon style="font-size:12px;height:12px;width:12px;">visibility</mat-icon>
                      Contacto visible
                    </span>
                  } @else {
                    <span class="badge-anonimo" style="margin-left:8px;">
                      <mat-icon style="font-size:12px;height:12px;width:12px;">visibility_off</mat-icon>
                      Anónimo
                    </span>
                  }
                </div>
                <div style="color:#9E9E9E; font-size:0.85rem; margin-top:4px;">
                  {{ p.provincia }}, {{ p.ciudad }} · {{ p.superficieM2 }}m² · {{ p.anioPresupuesto }}
                </div>
              </div>
              <div class="row-price">
                <span style="font-size:1.3rem; font-weight:700; color:#4CAF50;">
                  USD {{ p.costoPorM2 | number:'1.0-0' }}/m²
                </span>
              </div>
              <button mat-icon-button style="color:#f44336;" (click)="confirmarEliminar(p)"
                      title="Eliminar">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .perfil-header { display: flex; gap: 20px; align-items: center; margin-bottom: 32px; }
    .avatar { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; background: #333; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }

    .badge-acceso {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3);
      color: #4CAF50; padding: 2px 10px; border-radius: 20px; font-size: 0.8rem; margin-top: 8px;
    }
    .badge-sin-acceso {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.3);
      color: #f44336; padding: 2px 10px; border-radius: 20px; font-size: 0.8rem; margin-top: 8px;
    }
    .badge-visible {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3);
      color: #4CAF50; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem;
    }
    .badge-anonimo {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(158,158,158,0.1); border: 1px solid rgba(158,158,158,0.2);
      color: #9E9E9E; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem;
    }

    .perfil-stats { display: flex; gap: 32px; background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 20px 24px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-number { font-size: 2rem; font-weight: 700; color: #4CAF50; line-height: 1; }
    .stat-label { font-size: 0.75rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

    .banner-success {
      display: flex; align-items: center; gap: 8px;
      background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3);
      color: #4CAF50; padding: 12px 16px; border-radius: 8px;
      font-size: 0.9rem; margin-bottom: 8px;
    }
    .banner-warning {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3);
      color: #FFC107; padding: 12px 16px; border-radius: 8px;
      font-size: 0.9rem; margin-bottom: 8px;
    }

    .form-card {
      background: #1E1E1E !important;
      border: 1px solid #333;
      border-radius: 12px;
    }

    .form-row { display: flex; gap: 16px; }
    @media (max-width: 600px) { .form-row { flex-direction: column; } }

    .empty-state { text-align: center; padding: 40px; color: #555; }
    .empty-state mat-icon { font-size: 40px; height: 40px; width: 40px; display: block; margin: 0 auto 12px; }

    .presupuestos-list { display: flex; flex-direction: column; gap: 12px; }
    .presupuesto-row { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .row-main { flex: 1; }
    .row-price { min-width: 140px; text-align: right; }
  `]
})
export class PerfilComponent implements OnInit {

  auth = inject(AuthService);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);

  saving = false;
  loadingPresupuestos = signal(false);
  provincias = PROVINCIAS;

  misPresupuestos = signal<Presupuesto[]>([]);

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    telefono: [''],
    whatsapp: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
    direccion: [''],
    ciudad: [''],
    provincia: [''],
    bio: ['', [Validators.maxLength(300)]],
    linkedinUrl: [''],
    instagramUrl: [''],
    behanceUrl: [''],
    pinterestUrl: [''],
    sitioWeb: ['']
  });

  get perfilCompleto(): boolean {
    return !!this.auth.currentUser()?.perfilCompleto;
  }

  get bioCount(): number {
    return (this.form.value.bio ?? '').length;
  }

  get linkedinPreview(): string { return this.cleanUrl(this.form.value.linkedinUrl); }
  get instagramPreview(): string { return this.cleanUrl(this.form.value.instagramUrl); }
  get behancePreview(): string { return this.cleanUrl(this.form.value.behanceUrl); }
  get pinterestPreview(): string { return this.cleanUrl(this.form.value.pinterestUrl); }
  get sitioWebPreview(): string { return this.cleanUrl(this.form.value.sitioWeb); }

  private cleanUrl(url: string | null | undefined): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  }

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) {
      this.form.patchValue({
        nombre: u.nombre,
        apellido: u.apellido,
        telefono: u.telefono ?? '',
        whatsapp: u.whatsapp ?? '',
        direccion: u.direccion ?? '',
        ciudad: u.ciudad ?? '',
        provincia: u.provincia ?? '',
        bio: u.bio ?? '',
        linkedinUrl: u.linkedinUrl ?? '',
        instagramUrl: u.instagramUrl ?? '',
        behanceUrl: u.behanceUrl ?? '',
        pinterestUrl: u.pinterestUrl ?? '',
        sitioWeb: u.sitioWeb ?? ''
      });
    } else {
      this.api.getMe().subscribe(user => {
        this.auth.currentUser.set(user);
        this.form.patchValue({
          nombre: user.nombre, apellido: user.apellido,
          telefono: user.telefono ?? '', whatsapp: user.whatsapp ?? '',
          direccion: user.direccion ?? '', ciudad: user.ciudad ?? '',
          provincia: user.provincia ?? '', bio: user.bio ?? '',
          linkedinUrl: user.linkedinUrl ?? '', instagramUrl: user.instagramUrl ?? '',
          behanceUrl: user.behanceUrl ?? '', pinterestUrl: user.pinterestUrl ?? '',
          sitioWeb: user.sitioWeb ?? ''
        });
      });
    }

    this.loadingPresupuestos.set(true);
    this.api.getMisPresupuestos().subscribe({
      next: ps => { this.misPresupuestos.set(ps); this.loadingPresupuestos.set(false); },
      error: () => this.loadingPresupuestos.set(false)
    });
  }

  guardar() {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.updatePerfil(this.form.value as any).subscribe({
      next: (updated) => {
        this.auth.currentUser.set(updated);
        this.saving = false;
        this.snackbar.open('Perfil guardado', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackbar.open('Error al guardar', 'OK', { duration: 3000 });
      }
    });
  }

  confirmarEliminar(p: Presupuesto) {
    if (!confirm('¿Eliminar este presupuesto? Esta acción no se puede deshacer.')) return;
    this.api.eliminarPresupuesto(p.id).subscribe({
      next: () => {
        this.misPresupuestos.update(ps => ps.filter(x => x.id !== p.id));
        this.auth.loadCurrentUser();
        this.snackbar.open('Presupuesto eliminado', 'OK', { duration: 3000 });
      },
      error: () => this.snackbar.open('Error al eliminar', 'OK', { duration: 3000 })
    });
  }

  tipoLabel(t: string) { return TIPO_OBRA_LABELS[t as keyof typeof TIPO_OBRA_LABELS] || t; }
  catLabel(c: string) { return CATEGORIA_LABELS[c as keyof typeof CATEGORIA_LABELS] || c; }
}
