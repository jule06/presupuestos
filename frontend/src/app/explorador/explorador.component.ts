import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../core/services/api.service';
import { Presupuesto, Estadisticas, PageResult, TIPO_OBRA_LABELS, CATEGORIA_LABELS } from '../shared/models/presupuesto.model';
import { PresupuestoDetailDialogComponent } from './presupuesto-detail-dialog.component';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán'
];

@Component({
  selector: 'app-explorador',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatSidenavModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatProgressBarModule, MatDialogModule, MatPaginatorModule
  ],
  template: `
    <div class="explorador-layout">

      <!-- Sidebar filtros -->
      <aside class="filtros-panel">
        <div class="filtros-header">
          <span style="font-weight:600;">Filtros</span>
          <button mat-button (click)="limpiarFiltros()" style="color:#9E9E9E; font-size:0.8rem;">
            Limpiar
          </button>
        </div>

        <form [formGroup]="filtros" class="filtros-form">
          <mat-form-field appearance="outline" style="width:100%;">
            <mat-label>Tipo de obra</mat-label>
            <mat-select formControlName="tipoObra">
              <mat-option value="">Todos</mat-option>
              @for (t of tiposObra; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:100%;">
            <mat-label>Provincia</mat-label>
            <mat-select formControlName="provincia">
              <mat-option value="">Todas</mat-option>
              @for (p of provincias; track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:100%;">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoriaTerminacion">
              <mat-option value="">Todas</mat-option>
              <mat-option value="BASICA">Básica</mat-option>
              <mat-option value="MEDIA">Media</mat-option>
              <mat-option value="PREMIUM">Premium</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="filtro-grupo">
            <span class="filtro-label">Año</span>
            <div class="form-row-2">
              <mat-form-field appearance="outline">
                <mat-label>Desde</mat-label>
                <input matInput type="number" formControlName="anioDesde" placeholder="2018">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Hasta</mat-label>
                <input matInput type="number" formControlName="anioHasta" placeholder="2025">
              </mat-form-field>
            </div>
          </div>

          <div class="filtro-grupo">
            <span class="filtro-label">Superficie (m²)</span>
            <div class="form-row-2">
              <mat-form-field appearance="outline">
                <mat-label>Mín</mat-label>
                <input matInput type="number" formControlName="m2Min" placeholder="50">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Máx</mat-label>
                <input matInput type="number" formControlName="m2Max" placeholder="500">
              </mat-form-field>
            </div>
          </div>

          <div class="filtro-grupo">
            <span class="filtro-label">Costo/m² (USD)</span>
            <div class="form-row-2">
              <mat-form-field appearance="outline">
                <mat-label>Mín</mat-label>
                <input matInput type="number" formControlName="costoM2Min" placeholder="300">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Máx</mat-label>
                <input matInput type="number" formControlName="costoM2Max" placeholder="1500">
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" style="width:100%;">
            <mat-label>Ordenar por</mat-label>
            <mat-select formControlName="sortBy">
              <mat-option value="fechaCarga">Fecha de carga</mat-option>
              <mat-option value="costoPorM2">Costo/m²</mat-option>
              <mat-option value="superficieM2">Superficie</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </aside>

      <!-- Contenido principal -->
      <main class="main-content">

        <!-- Stats bar -->
        @if (estadisticas()) {
          <div class="stats-bar">
            <div class="stat-box">
              <span class="stat-number">USD {{ estadisticas()!.promedioCostoM2 | number:'1.0-0' }}</span>
              <span class="stat-label">Promedio /m²</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">USD {{ estadisticas()!.medianaCostoM2 | number:'1.0-0' }}</span>
              <span class="stat-label">Mediana /m²</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">USD {{ estadisticas()!.minCostoM2 | number:'1.0-0' }}</span>
              <span class="stat-label">Mínimo /m²</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">USD {{ estadisticas()!.maxCostoM2 | number:'1.0-0' }}</span>
              <span class="stat-label">Máximo /m²</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">{{ estadisticas()!.totalRegistros }}</span>
              <span class="stat-label">Registros</span>
            </div>
          </div>
        }

        @if (loading()) {
          <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
        }

        <!-- Grid de cards -->
        <div class="cards-grid">
          @for (p of presupuestos(); track p.id) {
            <div class="rp-card presupuesto-card" (click)="openDetail(p)">
              <div class="card-header">
                <span class="chip-tipo">{{ tipoLabel(p.tipoObra) }}</span>
                <span [class]="'chip-categoria ' + p.categoriaTerminacion">
                  {{ catLabel(p.categoriaTerminacion) }}
                </span>
              </div>

              <div class="card-location">
                <mat-icon>location_on</mat-icon>
                {{ p.provincia }}{{ p.ciudad ? ', ' + p.ciudad : '' }}{{ p.barrio ? ' — ' + p.barrio : '' }}
              </div>

              <div class="card-meta">
                <span>{{ p.superficieM2 }} m²</span>
                <span class="dot">·</span>
                <span>{{ p.anioPresupuesto }}</span>
              </div>

              <div class="card-price">
                <span class="price-m2">USD {{ p.costoPorM2 | number:'1.0-0' }}</span>
                <span class="price-unit">/m²</span>
              </div>
              <div class="price-total">Total: USD {{ p.costoTotal | number:'1.0-0' }}</div>

              @if (p.desglose) {
                <div class="card-desglose-hint">
                  <mat-icon style="font-size:12px;height:12px;width:12px;">pie_chart</mat-icon>
                  Con desglose por rubro
                </div>
              }

              <div class="card-footer">
                <span style="color:#555; font-size:0.75rem;">
                  {{ p.fechaCarga | date:'MMM y' }}
                </span>
                <button mat-icon-button style="color:#9E9E9E;" (click)="openDetail(p); $event.stopPropagation()">
                  <mat-icon>open_in_new</mat-icon>
                </button>
              </div>
            </div>
          }

          @if (presupuestos().length === 0 && !loading()) {
            <div class="empty-state" style="grid-column:1/-1;">
              <mat-icon style="font-size:48px;height:48px;width:48px;color:#444;">search_off</mat-icon>
              <p>No hay presupuestos con esos filtros todavía.</p>
              <button mat-button (click)="limpiarFiltros()" color="primary">Limpiar filtros</button>
            </div>
          }
        </div>

        <!-- Paginación -->
        @if (totalElements() > 0) {
          <mat-paginator
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            [pageIndex]="currentPage()"
            (page)="onPageChange($event)"
            style="background: transparent; color: #9E9E9E;">
          </mat-paginator>
        }

      </main>
    </div>
  `,
  styles: [`
    .explorador-layout {
      display: flex;
      height: calc(100vh - 64px);
      overflow: hidden;
    }

    .filtros-panel {
      width: 260px;
      min-width: 260px;
      background: #1A1A1A;
      border-right: 1px solid #333;
      overflow-y: auto;
      padding: 16px;
    }

    .filtros-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .filtros-form mat-form-field { font-size: 0.85rem; }

    .filtro-grupo { margin-bottom: 4px; }
    .filtro-label { font-size: 0.75rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }

    .form-row-2 { display: flex; gap: 8px; }
    .form-row-2 mat-form-field { flex: 1; }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }

    .stats-bar {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
      background: #1E1E1E;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 16px 24px;
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      min-width: 100px;
    }

    .stat-number { font-size: 1.4rem; font-weight: 700; color: #4CAF50; line-height: 1; }
    .stat-label { font-size: 0.7rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .presupuesto-card {
      cursor: pointer;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .card-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }

    .card-location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #9E9E9E;
      font-size: 0.8rem;
    }
    .card-location mat-icon { font-size: 14px; height: 14px; width: 14px; }

    .card-meta { color: #9E9E9E; font-size: 0.8rem; }
    .dot { margin: 0 4px; }

    .card-price { display: flex; align-items: baseline; gap: 4px; }
    .price-m2 { font-size: 1.7rem; font-weight: 700; color: #4CAF50; line-height: 1; }
    .price-unit { color: #9E9E9E; font-size: 0.85rem; }
    .price-total { color: #9E9E9E; font-size: 0.8rem; margin-top: -4px; }

    .card-desglose-hint {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #9E9E9E;
      font-size: 0.75rem;
    }

    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }

    .empty-state { text-align: center; padding: 64px; color: #555; }
    .empty-state mat-icon { display: block; margin: 0 auto 16px; }

    @media (max-width: 768px) {
      .explorador-layout { flex-direction: column; height: auto; }
      .filtros-panel { width: 100%; border-right: none; border-bottom: 1px solid #333; }
      .stats-bar { flex-wrap: wrap; gap: 12px; }
    }
  `]
})
export class ExploradorComponent implements OnInit {

  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  presupuestos = signal<Presupuesto[]>([]);
  estadisticas = signal<Estadisticas | null>(null);
  loading = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = 20;

  provincias = PROVINCIAS;

  tiposObra = Object.entries(TIPO_OBRA_LABELS).map(([value, label]) => ({ value, label }));

  filtros = this.fb.group({
    tipoObra: [''],
    provincia: [''],
    categoriaTerminacion: [''],
    anioDesde: [null as number | null],
    anioHasta: [null as number | null],
    m2Min: [null as number | null],
    m2Max: [null as number | null],
    costoM2Min: [null as number | null],
    costoM2Max: [null as number | null],
    sortBy: ['fechaCarga']
  });

  ngOnInit() {
    this.cargar();
    this.filtros.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(0);
      this.cargar();
    });
  }

  cargar() {
    this.loading.set(true);
    const f = this.filtros.value;

    this.api.listarPresupuestos(f, this.currentPage(), this.pageSize, f.sortBy || 'fechaCarga').subscribe({
      next: (page: PageResult<Presupuesto>) => {
        this.presupuestos.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.api.getEstadisticas(f).subscribe(stats => this.estadisticas.set(stats));
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize = event.pageSize;
    this.cargar();
  }

  limpiarFiltros() {
    this.filtros.reset({ sortBy: 'fechaCarga' });
  }

  openDetail(p: Presupuesto) {
    this.dialog.open(PresupuestoDetailDialogComponent, {
      data: p,
      width: '640px',
      maxHeight: '90vh',
      panelClass: 'detail-dialog'
    });
  }

  tipoLabel(tipo: string): string {
    return TIPO_OBRA_LABELS[tipo as keyof typeof TIPO_OBRA_LABELS] || tipo;
  }

  catLabel(cat: string): string {
    return CATEGORIA_LABELS[cat as keyof typeof CATEGORIA_LABELS] || cat;
  }
}
