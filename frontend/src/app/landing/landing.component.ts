import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../auth/auth.service';
import { Presupuesto, TIPO_OBRA_LABELS, CATEGORIA_LABELS } from '../shared/models/presupuesto.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="landing">

      <!-- Hero -->
      <section class="hero">
        <div class="container">
          <div class="hero-badge">
            <mat-icon style="font-size:14px;height:14px;width:14px;">verified</mat-icon>
            Datos reales de arquitectos argentinos
          </div>
          <h1 class="hero-title">
            Conocé el precio real<br>de la obra
          </h1>
          <p class="hero-subtitle">
            Presupuestos reales de arquitectos, para arquitectos.<br>
            Anónimos y verificados por la comunidad.
          </p>

          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-number">{{ totalPresupuestos() }}</span>
              <span class="stat-label">presupuestos cargados</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">100%</span>
              <span class="stat-label">anónimos</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">Gratis</span>
              <span class="stat-label">das para recibir</span>
            </div>
          </div>

          <!-- CTA -->
          <div class="cta-section">
            @if (!auth.isLoggedIn()) {
              <a mat-raised-button color="primary" routerLink="/auth" style="font-size:1rem; padding:12px 32px;">
                <mat-icon>person_add</mat-icon>
                Crear cuenta gratis
              </a>
              <a mat-button routerLink="/auth" style="color:#9E9E9E; font-size:0.875rem;">
                ¿Ya tenés cuenta? Ingresá
              </a>
            } @else if (auth.currentUser() && !auth.currentUser()!.accesoDesbloqueado) {
              <a mat-raised-button color="primary" routerLink="/cargar" style="font-size:1rem; padding:12px 32px;">
                <mat-icon>add</mat-icon>
                Cargá tu primer presupuesto
              </a>
            } @else if (auth.currentUser()?.accesoDesbloqueado) {
              <a mat-raised-button color="primary" [routerLink]="['/explorador']" style="font-size:1rem; padding:12px 32px;">
                <mat-icon>search</mat-icon>
                Ver el explorador
              </a>
            }
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="how-section">
        <div class="container">
          <h2 class="section-title">Cómo funciona</h2>
          <div class="steps-grid">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-icon"><mat-icon>person_add</mat-icon></div>
              <h3>Creá tu cuenta</h3>
              <p>Con Google o con email. En menos de un minuto.</p>
            </div>
            <div class="step-arrow"><mat-icon>arrow_forward</mat-icon></div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-icon"><mat-icon>upload_file</mat-icon></div>
              <h3>Cargá un presupuesto</h3>
              <p>Uno tuyo, real. En 3 minutos.</p>
            </div>
            <div class="step-arrow"><mat-icon>arrow_forward</mat-icon></div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-icon"><mat-icon>insights</mat-icon></div>
              <h3>Accedé a todos</h3>
              <p>{{ totalPresupuestos() > 0 ? totalPresupuestos() + ' presupuestos con' : 'Datos con' }} desglose, filtros y estadísticas.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Preview cards -->
      <section class="preview-section">
        <div class="container">
          <h2 class="section-title">
            Lo que vas a ver al acceder
          </h2>
          <p class="section-subtitle">
            {{ totalPresupuestos() }} presupuestos detallados con desglose por rubro
          </p>

          <div class="preview-grid">
            @for (p of previewCards(); track p.id; let i = $index) {
              <div class="rp-card blur-overlay">
                <div class="card-inner">
                  <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px;">
                    <span class="chip-tipo">{{ tipoLabel(p.tipoObra) }}</span>
                    <span [class]="'chip-categoria ' + p.categoriaTerminacion">{{ catLabel(p.categoriaTerminacion) }}</span>
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="color:#9E9E9E; font-size:0.8rem; display:flex; align-items:center; gap:4px;">
                      <mat-icon style="font-size:14px;height:14px;width:14px;">location_on</mat-icon>
                      {{ p.provincia }}, {{ p.ciudad }}
                    </div>
                    <div style="color:#9E9E9E; font-size:0.8rem; margin-top:4px;">
                      {{ p.superficieM2 }} m² · {{ p.anioPresupuesto }}
                    </div>
                  </div>
                  <div style="display:flex; align-items:baseline; gap:8px;">
                    <span style="font-size:1.8rem; font-weight:700; color:#4CAF50;">
                      USD {{ p.costoPorM2 | number:'1.0-0' }}
                    </span>
                    <span style="color:#9E9E9E; font-size:0.85rem;">/m²</span>
                  </div>
                  <div style="color:#9E9E9E; font-size:0.8rem; margin-top:4px;">
                    Total: USD {{ p.costoTotal | number:'1.0-0' }}
                  </div>
                </div>
                <div class="lock-icon">
                  <mat-icon style="font-size:2.5rem; width:auto; height:auto; opacity:0.9;">lock</mat-icon>
                  <div style="font-size:0.75rem; font-weight:600; margin-top:4px; opacity:0.8;">Desbloqueá gratis</div>
                </div>
              </div>
            }

            @if (previewCards().length === 0) {
              @for (dummy of [1,2,3]; track dummy) {
                <div class="rp-card blur-overlay" style="min-height:180px;">
                  <div class="lock-icon">
                    <mat-icon style="font-size:2.5rem; width:auto; height:auto; opacity:0.9;">lock</mat-icon>
                    <div style="font-size:0.75rem; font-weight:600; margin-top:4px;">Sé el primero</div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .landing { min-height: calc(100vh - 64px); }

    .hero {
      padding: 80px 0 60px;
      background: radial-gradient(ellipse at 50% 0%, rgba(46,125,50,0.12) 0%, transparent 70%);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(76,175,80,0.1);
      border: 1px solid rgba(76,175,80,0.3);
      color: #4CAF50;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: clamp(2.2rem, 5vw, 3.8rem);
      font-weight: 800;
      line-height: 1.1;
      margin: 0 0 20px;
      letter-spacing: -2px;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: #9E9E9E;
      margin: 0 0 40px;
      line-height: 1.6;
    }

    .stats-row {
      display: flex;
      align-items: center;
      gap: 32px;
      margin-bottom: 48px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #4CAF50;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #9E9E9E;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: #333;
    }

    .cta-section { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }

    .preview-section { padding: 64px 0; background: rgba(255,255,255,0.02); }

    .section-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }

    .section-subtitle { color: #9E9E9E; margin: 0 0 40px; }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .card-inner { filter: blur(4px); user-select: none; }

    .how-section { padding: 64px 0 80px; }

    .steps-grid {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 48px;
    }

    .step {
      flex: 1;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      position: relative;
    }

    .step-number {
      position: absolute;
      top: -12px;
      left: 24px;
      background: var(--color-primary);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .step-icon mat-icon { font-size: 2rem; height: 2rem; width: 2rem; color: #4CAF50; }
    .step h3 { margin: 12px 0 8px; font-size: 1rem; font-weight: 600; }
    .step p { color: #9E9E9E; font-size: 0.875rem; margin: 0; }
    .step-arrow mat-icon { color: #444; }

    @media (max-width: 768px) {
      .steps-grid { flex-direction: column; }
      .step-arrow { transform: rotate(90deg); }
      .stats-row { gap: 16px; }
    }
  `]
})
export class LandingComponent implements OnInit {

  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  previewCards = signal<Presupuesto[]>([]);
  totalPresupuestos = signal<number>(0);

  ngOnInit() {
    this.api.getPreview().subscribe(cards => this.previewCards.set(cards));
    this.api.getTotalCount().subscribe(r => this.totalPresupuestos.set(r.total));

    if (this.auth.isLoggedIn()) {
      const user = this.auth.currentUser();
      if (user?.accesoDesbloqueado) {
        this.router.navigate(['/explorador']);
      }
    }
  }

  tipoLabel(tipo: string): string {
    return TIPO_OBRA_LABELS[tipo as keyof typeof TIPO_OBRA_LABELS] || tipo;
  }

  catLabel(cat: string): string {
    return CATEGORIA_LABELS[cat as keyof typeof CATEGORIA_LABELS] || cat;
  }
}
