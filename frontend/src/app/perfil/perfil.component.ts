import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../auth/auth.service';
import { Presupuesto, TIPO_OBRA_LABELS, CATEGORIA_LABELS } from '../shared/models/presupuesto.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatSnackBarModule, MatDialogModule
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
          <span class="stat-number" style="color: {{ auth.currentUser()?.accesoDesbloqueado ? '#4CAF50' : '#f44336' }};">
            {{ auth.currentUser()?.accesoDesbloqueado ? '✓' : '✗' }}
          </span>
          <span class="stat-label">Acceso al explorador</span>
        </div>
      </div>

      <!-- CTA cargar -->
      <div style="margin: 24px 0;">
        <a mat-raised-button color="primary" routerLink="/cargar">
          <mat-icon>add</mat-icon> Cargar otro presupuesto
        </a>
      </div>

      <!-- Lista de mis presupuestos -->
      <h2 style="font-size:1.1rem; font-weight:600; margin: 32px 0 16px;">
        Mis presupuestos cargados
      </h2>

      @if (loading()) {
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

    .perfil-stats { display: flex; gap: 32px; background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 20px 24px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-number { font-size: 2rem; font-weight: 700; color: #4CAF50; line-height: 1; }
    .stat-label { font-size: 0.75rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

    .empty-state { text-align: center; padding: 40px; color: #555; }
    .empty-state mat-icon { font-size: 40px; height: 40px; width: 40px; display: block; margin: 0 auto 12px; }

    .presupuestos-list { display: flex; flex-direction: column; gap: 12px; }

    .presupuesto-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .row-main { flex: 1; }
    .row-price { min-width: 140px; text-align: right; }
  `]
})
export class PerfilComponent implements OnInit {

  auth = inject(AuthService);
  private api = inject(ApiService);
  private snackbar = inject(MatSnackBar);

  misPresupuestos = signal<Presupuesto[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.api.getMisPresupuestos().subscribe({
      next: ps => { this.misPresupuestos.set(ps); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  confirmarEliminar(p: Presupuesto) {
    if (!confirm(`¿Eliminar este presupuesto? Esta acción no se puede deshacer.`)) return;
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
