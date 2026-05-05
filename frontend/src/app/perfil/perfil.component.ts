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
import { PresupuestoDetailDialogComponent } from '../explorador/presupuesto-detail-dialog.component';

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
    <div class="container perfil-page">

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
          <form [formGroup]="form" class="social-list">

            <!-- LinkedIn -->
            <div class="social-row">
              <div class="social-badge li" title="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <div class="social-field-wrap">
                <mat-form-field appearance="outline" class="social-field">
                  <mat-label>LinkedIn</mat-label>
                  <input matInput formControlName="linkedinUrl" placeholder="linkedin.com/in/tu-perfil">
                </mat-form-field>
                @if (linkedinPreview) {
                  <a [href]="linkedinPreview" target="_blank" class="social-preview-link">
                    <mat-icon>open_in_new</mat-icon>{{ linkedinPreview }}
                  </a>
                }
              </div>
            </div>

            <!-- Instagram -->
            <div class="social-row">
              <div class="social-badge ig" title="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <div class="social-field-wrap">
                <mat-form-field appearance="outline" class="social-field">
                  <mat-label>Instagram</mat-label>
                  <input matInput formControlName="instagramUrl" placeholder="instagram.com/tu_usuario">
                </mat-form-field>
                @if (instagramPreview) {
                  <a [href]="instagramPreview" target="_blank" class="social-preview-link">
                    <mat-icon>open_in_new</mat-icon>{{ instagramPreview }}
                  </a>
                }
              </div>
            </div>

            <!-- Behance -->
            <div class="social-row">
              <div class="social-badge be" title="Behance">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1769ff"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.155 1.36-.487.36-1.054.63-1.7.8-.646.16-1.31.24-2 .24H0V4.51h6.938zm-.4 5.38c.59 0 1.07-.14 1.44-.42.367-.28.55-.72.55-1.31 0-.33-.06-.61-.18-.82-.12-.22-.29-.39-.5-.53-.21-.13-.45-.22-.72-.27-.27-.06-.55-.08-.84-.08H3.24v3.43h3.3zm.16 5.55c.31 0 .61-.03.89-.08.29-.06.54-.15.76-.3.22-.14.4-.34.53-.58.13-.24.2-.56.2-.95 0-.76-.21-1.3-.64-1.62-.43-.32-1-.48-1.72-.48H3.24v4.01h3.46zm7.56 3.14c.64 0 1.21-.14 1.72-.42.5-.28.93-.66 1.29-1.15.35-.49.62-1.06.8-1.71.17-.66.26-1.36.26-2.11 0-.75-.09-1.45-.28-2.1-.19-.64-.46-1.2-.81-1.67-.36-.48-.8-.86-1.32-1.14-.53-.28-1.12-.42-1.79-.42-.71 0-1.34.15-1.88.44-.54.3-.99.69-1.34 1.17-.35.48-.62 1.04-.8 1.68-.18.64-.27 1.31-.27 2.03 0 .74.09 1.43.26 2.08.18.65.44 1.22.79 1.7.35.49.8.87 1.34 1.16.54.28 1.17.43 1.87.43zm.43-7.82c.67 0 1.21.26 1.63.78.42.52.63 1.28.63 2.27 0 .99-.21 1.75-.63 2.27-.42.52-.96.78-1.63.78-.68 0-1.22-.26-1.64-.78-.41-.52-.62-1.28-.62-2.27 0-1 .21-1.75.62-2.27.42-.52.96-.78 1.64-.78zm0-4.39h4.96v1.27h-4.96V6.32z"/></svg>
              </div>
              <div class="social-field-wrap">
                <mat-form-field appearance="outline" class="social-field">
                  <mat-label>Behance</mat-label>
                  <input matInput formControlName="behanceUrl" placeholder="behance.net/tu_perfil">
                </mat-form-field>
                @if (behancePreview) {
                  <a [href]="behancePreview" target="_blank" class="social-preview-link">
                    <mat-icon>open_in_new</mat-icon>{{ behancePreview }}
                  </a>
                }
              </div>
            </div>

            <!-- Pinterest -->
            <div class="social-row">
              <div class="social-badge pi" title="Pinterest">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#E60023"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              </div>
              <div class="social-field-wrap">
                <mat-form-field appearance="outline" class="social-field">
                  <mat-label>Pinterest</mat-label>
                  <input matInput formControlName="pinterestUrl" placeholder="pinterest.com/tu_perfil">
                </mat-form-field>
                @if (pinterestPreview) {
                  <a [href]="pinterestPreview" target="_blank" class="social-preview-link">
                    <mat-icon>open_in_new</mat-icon>{{ pinterestPreview }}
                  </a>
                }
              </div>
            </div>

            <!-- Sitio web -->
            <div class="social-row">
              <div class="social-badge web" title="Sitio web">
                <mat-icon style="color:#9E9E9E;font-size:20px;height:20px;width:20px;">language</mat-icon>
              </div>
              <div class="social-field-wrap">
                <mat-form-field appearance="outline" class="social-field">
                  <mat-label>Sitio web</mat-label>
                  <input matInput formControlName="sitioWeb" placeholder="tu-sitio.com">
                </mat-form-field>
                @if (sitioWebPreview) {
                  <a [href]="sitioWebPreview" target="_blank" class="social-preview-link">
                    <mat-icon>open_in_new</mat-icon>{{ sitioWebPreview }}
                  </a>
                }
              </div>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- Save button -->
      <div class="save-bar">
        <button mat-raised-button color="primary"
                [disabled]="form.invalid || saving"
                (click)="guardar()"
                class="save-btn">
          <span class="save-inner">
            @if (saving) {
              <mat-spinner diameter="18"></mat-spinner>
            } @else {
              <mat-icon>save</mat-icon>
            }
            {{ saving ? 'Guardando...' : 'Guardar perfil' }}
          </span>
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
            <div class="rp-card presupuesto-row" (click)="openDetail(p)">
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
              <button mat-icon-button style="color:#f44336;" (click)="confirmarEliminar(p);$event.stopPropagation()"
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
    .perfil-page { padding: 40px 24px; max-width: 900px; }

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

    /* ── Social links ──────────────────────────────────────────── */
    .social-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 16px;
    }

    .social-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .social-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 8px; /* alinea con el input dentro del mat-form-field */
    }
    .social-badge.li  { background: rgba(10,102,194,0.12); }
    .social-badge.ig  { background: rgba(225,48,108,0.10); }
    .social-badge.be  { background: rgba(23,105,255,0.12); }
    .social-badge.pi  { background: rgba(230,0,35,0.10); }
    .social-badge.web { background: rgba(158,158,158,0.08); }

    .social-field-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .social-field { width: 100%; margin: 0; }

    .social-preview-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #4CAF50;
      font-size: 0.75rem;
      text-decoration: none;
      margin-top: -8px;
      margin-bottom: 4px;
      padding: 0 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      mat-icon { font-size: 12px; height: 12px; width: 12px; flex-shrink: 0; }
      &:hover { text-decoration: underline; }
    }

    .empty-state { text-align: center; padding: 40px; color: #555; }
    .empty-state mat-icon { font-size: 40px; height: 40px; width: 40px; display: block; margin: 0 auto 12px; }

    .presupuestos-list { display: flex; flex-direction: column; gap: 12px; }
    .presupuesto-row { display: flex; align-items: center; gap: 16px; padding: 16px; cursor: pointer; }
    .row-main { flex: 1; min-width: 0; }
    .row-price { min-width: 120px; text-align: right; flex-shrink: 0; }

    .save-bar { margin-top: 24px; display: flex; gap: 16px; align-items: center; }
    .save-btn { min-width: 160px; }
    .save-inner {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    @media (max-width: 599px) {
      .perfil-page { padding: 16px 16px 80px; }
      .perfil-header { flex-direction: column; align-items: center; text-align: center; }
      .perfil-stats { flex-wrap: wrap; gap: 20px; padding: 16px; }
      .presupuesto-row { flex-wrap: wrap; }
      .row-price { min-width: 0; flex: 1; text-align: left; }
      .save-bar {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        padding: 12px 16px;
        background: #1A1A1A;
        border-top: 1px solid #333;
        margin: 0;
        z-index: 50;
      }
      .save-btn { flex: 1; }
    }
  `]
})
export class PerfilComponent implements OnInit {

  auth = inject(AuthService);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

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

  openDetail(p: Presupuesto) {
    const isMobile = window.innerWidth < 600;
    this.dialog.open(PresupuestoDetailDialogComponent, {
      data: p,
      width: isMobile ? '100vw' : '640px',
      maxWidth: isMobile ? '100vw' : '80vw',
      maxHeight: isMobile ? '100dvh' : '90vh',
      height: isMobile ? '100dvh' : 'auto',
      panelClass: isMobile ? ['detail-dialog', 'mobile-fullscreen-dialog'] : ['detail-dialog']
    });
  }

  tipoLabel(t: string) { return TIPO_OBRA_LABELS[t as keyof typeof TIPO_OBRA_LABELS] || t; }
  catLabel(c: string) { return CATEGORIA_LABELS[c as keyof typeof CATEGORIA_LABELS] || c; }
}
