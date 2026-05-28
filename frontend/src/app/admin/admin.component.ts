import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../core/services/api.service';
import { Usuario } from '../shared/models/usuario.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="admin-page">
      <div class="admin-container">

        <div class="page-header">
          <mat-icon class="header-icon">admin_panel_settings</mat-icon>
          <div>
            <h1 class="page-title">Panel de Administración</h1>
            <p class="page-subtitle">Gestión de datos y usuarios de Precio Obra</p>
          </div>
        </div>

        <!-- Presupuestos section -->
        <section class="admin-section">
          <h2 class="section-title">
            <mat-icon>folder_open</mat-icon>
            Presupuestos
          </h2>

          <div class="action-card danger-card">
            <div class="action-info">
              <div class="action-name">Borrar todos los presupuestos</div>
              <div class="action-desc">
                Elimina permanentemente todos los presupuestos de la base de datos y resetea los contadores de usuarios.
                Esta acción no se puede deshacer.
              </div>
            </div>
            <button
              class="btn-danger"
              [disabled]="deleting()"
              (click)="deleteAll()">
              @if (deleting()) {
                <mat-icon class="spin">hourglass_empty</mat-icon>
                Eliminando...
              } @else {
                <mat-icon>delete_sweep</mat-icon>
                Borrar todos
              }
            </button>
          </div>

          @if (deleteMsg()) {
            <div class="feedback-msg" [class.error]="deleteError()">
              <mat-icon>{{ deleteError() ? 'error' : 'check_circle' }}</mat-icon>
              {{ deleteMsg() }}
            </div>
          }

          <div class="action-card seed-card">
            <div class="action-info">
              <div class="action-name">Cargar seed de presupuestos</div>
              <div class="action-desc">
                Inserta los presupuestos de muestra (CABA y Buenos Aires).
                Podés ejecutarlo aunque ya haya datos — se agregan encima de los existentes.
              </div>
            </div>
            <button
              class="btn-seed"
              [disabled]="seeding()"
              (click)="ejecutarSeed()">
              @if (seeding()) {
                <mat-icon class="spin">hourglass_empty</mat-icon>
                Cargando...
              } @else {
                <mat-icon>upload</mat-icon>
                Cargar seed
              }
            </button>
          </div>

          @if (seedMsg()) {
            <div class="feedback-msg" [class.error]="seedError()">
              <mat-icon>{{ seedError() ? 'error' : 'check_circle' }}</mat-icon>
              {{ seedMsg() }}
            </div>
          }
        </section>

        <!-- Users section -->
        <section class="admin-section">
          <div class="section-header-row">
            <h2 class="section-title">
              <mat-icon>group</mat-icon>
              Usuarios registrados
              @if (usuarios().length > 0) {
                <span class="count-badge">{{ usuarios().length }}</span>
              }
            </h2>
            <button class="btn-secondary" (click)="loadUsuarios()" [disabled]="loadingUsers()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>

          @if (loadingUsers()) {
            <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
          }

          @if (usuarios().length > 0) {
            <div class="users-table-wrap">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acceso</th>
                    <th class="align-right">Presupuestos</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of usuarios(); track u.id) {
                    <tr [class.admin-row]="u.rol === 'ADMIN'">
                      <td>
                        <div class="user-cell">
                          @if (u.fotoUrl) {
                            <img [src]="u.fotoUrl" class="user-avatar" alt="">
                          } @else {
                            <div class="user-initials">{{ initials(u) }}</div>
                          }
                          <div>
                            <div class="user-name">{{ u.nombre }} {{ u.apellido }}</div>
                            <div class="user-email">{{ u.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span [class]="'role-badge ' + (u.rol === 'ADMIN' ? 'role-admin' : 'role-user')">
                          {{ u.rol === 'ADMIN' ? 'Admin' : 'User' }}
                        </span>
                      </td>
                      <td>
                        <span [class]="'access-badge ' + (u.accesoDesbloqueado ? 'access-ok' : 'access-pending')">
                          {{ u.accesoDesbloqueado ? 'Desbloqueado' : 'Pendiente' }}
                        </span>
                      </td>
                      <td class="align-right">
                        <span class="presup-count">{{ u.presupuestosCargados }}</span>
                      </td>
                      <td class="date-cell">{{ u.fechaRegistro | date:'dd/MM/yy' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (!loadingUsers()) {
            <div class="empty-users">
              <mat-icon>group_off</mat-icon>
              <span>No hay usuarios registrados</span>
            </div>
          }
        </section>

      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      min-height: calc(100vh - 64px);
      background: #0F0F0F;
      padding: 32px 24px 60px;
    }

    .admin-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header-icon {
      font-size: 40px; height: 40px; width: 40px;
      color: #4CAF50;
    }
    .page-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #E8E8E8;
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      margin: 4px 0 0;
      font-size: 0.85rem;
      color: #666;
    }

    /* Sections */
    .admin-section {
      background: #141414;
      border: 1px solid #1E1E1E;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #C0C0C0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title mat-icon {
      font-size: 18px; height: 18px; width: 18px;
      color: #4CAF50;
    }

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .count-badge {
      background: #1E1E1E;
      border: 1px solid #2E2E2E;
      border-radius: 20px;
      padding: 1px 9px;
      font-size: 0.72rem;
      font-weight: 600;
      color: #888;
    }

    /* Action card */
    .action-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 20px;
      border-radius: 10px;
      border: 1px solid #252525;
      background: #1A1A1A;
      flex-wrap: wrap;
    }
    .danger-card {
      border-color: rgba(239, 68, 68, 0.18);
      background: rgba(239, 68, 68, 0.04);
    }

    .action-info { flex: 1; min-width: 200px; }
    .action-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #D0D0D0;
      margin-bottom: 4px;
    }
    .action-desc {
      font-size: 0.78rem;
      color: #666;
      line-height: 1.5;
    }

    .btn-danger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 18px;
      height: 40px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #F87171;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .btn-danger:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
    }
    .btn-danger:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-danger mat-icon { font-size: 18px; height: 18px; width: 18px; }

    .seed-card {
      border-color: rgba(76,175,80,0.18);
      background: rgba(76,175,80,0.04);
    }

    .btn-seed {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 18px;
      height: 40px;
      background: rgba(76,175,80,0.12);
      border: 1px solid rgba(76,175,80,0.3);
      border-radius: 8px;
      color: #81C784;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .btn-seed:hover:not(:disabled) {
      background: rgba(76,175,80,0.2);
      border-color: rgba(76,175,80,0.5);
    }
    .btn-seed:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-seed mat-icon { font-size: 18px; height: 18px; width: 18px; }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px; height: 34px;
      background: #1E1E1E;
      border: 1px solid #2E2E2E;
      border-radius: 8px;
      color: #888;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .btn-secondary:hover:not(:disabled) { background: #262626; color: #C0C0C0; }
    .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-secondary mat-icon { font-size: 17px; height: 17px; width: 17px; }

    /* Feedback */
    .feedback-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      background: rgba(76, 175, 80, 0.08);
      border: 1px solid rgba(76, 175, 80, 0.2);
      color: #81C784;
    }
    .feedback-msg.error {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.2);
      color: #F87171;
    }
    .feedback-msg mat-icon { font-size: 18px; height: 18px; width: 18px; }

    /* Spin animation */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }

    /* Table */
    .users-table-wrap {
      overflow-x: auto;
      border-radius: 10px;
      border: 1px solid #1E1E1E;
    }
    .users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }
    .users-table th {
      background: #111;
      color: #555;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.65rem;
      letter-spacing: 0.07em;
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid #1E1E1E;
      white-space: nowrap;
    }
    .users-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #181818;
      color: #C0C0C0;
      vertical-align: middle;
    }
    .users-table tbody tr:last-child td { border-bottom: none; }
    .users-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
    .admin-row td { background: rgba(76,175,80,0.02); }

    .align-right { text-align: right; }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 180px;
    }
    .user-avatar {
      width: 32px; height: 32px;
      border-radius: 50%; object-fit: cover;
      flex-shrink: 0;
    }
    .user-initials {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: #2E7D32;
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
      flex-shrink: 0;
    }
    .user-name { font-weight: 500; color: #D8D8D8; white-space: nowrap; }
    .user-email { color: #666; font-size: 0.75rem; white-space: nowrap; }

    .role-badge {
      display: inline-block;
      padding: 2px 9px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .role-admin {
      background: rgba(76,175,80,0.12);
      border: 1px solid rgba(76,175,80,0.3);
      color: #81C784;
    }
    .role-user {
      background: #1A1A1A;
      border: 1px solid #2A2A2A;
      color: #777;
    }

    .access-badge {
      display: inline-block;
      padding: 2px 9px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .access-ok {
      background: rgba(76,175,80,0.08);
      border: 1px solid rgba(76,175,80,0.2);
      color: #66BB6A;
    }
    .access-pending {
      background: rgba(255,193,7,0.06);
      border: 1px solid rgba(255,193,7,0.2);
      color: #FFD54F;
    }

    .presup-count {
      font-weight: 700;
      color: #4CAF50;
    }

    .date-cell { color: #666; white-space: nowrap; }

    .empty-users {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 32px 16px;
      color: #555;
      font-size: 0.85rem;
      justify-content: center;
    }
    .empty-users mat-icon { font-size: 24px; height: 24px; width: 24px; }

    @media (max-width: 599px) {
      .admin-page { padding: 20px 16px 60px; }
      .page-title { font-size: 1.25rem; }
      .admin-section { padding: 18px 16px; }
      .action-card { flex-direction: column; align-items: flex-start; }
      .btn-danger { width: 100%; justify-content: center; }
    }
  `]
})
export class AdminComponent implements OnInit {

  private api = inject(ApiService);

  usuarios = signal<Usuario[]>([]);
  loadingUsers = signal(false);
  deleting = signal(false);
  deleteMsg = signal('');
  deleteError = signal(false);
  seeding = signal(false);
  seedMsg = signal('');
  seedError = signal(false);

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.loadingUsers.set(true);
    this.api.adminGetUsuarios().subscribe({
      next: (list) => {
        this.usuarios.set(list);
        this.loadingUsers.set(false);
      },
      error: () => this.loadingUsers.set(false)
    });
  }

  deleteAll() {
    if (!confirm('¿Estás seguro? Se eliminarán TODOS los presupuestos. Esta acción no se puede deshacer.')) return;
    this.deleting.set(true);
    this.deleteMsg.set('');
    this.api.adminDeleteAllPresupuestos().subscribe({
      next: (res) => {
        this.deleting.set(false);
        this.deleteError.set(false);
        this.deleteMsg.set(`${res.message} Se eliminaron ${res.eliminados} presupuestos.`);
        this.loadUsuarios();
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(true);
        this.deleteMsg.set('Error al eliminar los presupuestos. Intente nuevamente.');
      }
    });
  }

  ejecutarSeed() {
    this.seeding.set(true);
    this.seedMsg.set('');
    this.api.adminEjecutarSeed().subscribe({
      next: (res) => {
        this.seeding.set(false);
        this.seedError.set(false);
        this.seedMsg.set(`${res.message} Total en base de datos: ${res.total} presupuestos.`);
        this.loadUsuarios();
      },
      error: (err) => {
        this.seeding.set(false);
        this.seedError.set(true);
        this.seedMsg.set(err?.error?.message ?? 'Error al ejecutar el seed.');
      }
    });
  }

  initials(u: Usuario): string {
    return ((u.nombre?.[0] ?? '') + (u.apellido?.[0] ?? '')).toUpperCase() || '?';
  }
}
