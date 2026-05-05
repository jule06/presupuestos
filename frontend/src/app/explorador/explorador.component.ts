import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
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
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatDialogModule, MatPaginatorModule
  ],
  template: `
    <div class="explorador-layout" [formGroup]="filtros">

      <!-- Backdrop -->
      <div class="filtros-overlay" [class.visible]="showFilters()" (click)="showFilters.set(false)"></div>

      <!-- Filter Drawer -->
      <aside class="filtros-panel" [class.open]="showFilters()">
        <div class="drawer-handle"></div>
        <div class="filtros-header">
          <span class="filtros-title">Filtros</span>
          <div style="display:flex;gap:4px;align-items:center;">
            <button mat-button (click)="limpiarFiltros()" style="color:#9E9E9E;font-size:0.8rem;min-width:0;">
              Limpiar
            </button>
            <button mat-icon-button (click)="showFilters.set(false)" style="color:#9E9E9E;">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <div class="filtros-form">
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Tipo de obra</mat-label>
            <mat-select formControlName="tipoObra">
              <mat-option value="">Todos</mat-option>
              @for (t of tiposObra; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Provincia</mat-label>
            <mat-select formControlName="provincia">
              <mat-option value="">Todas</mat-option>
              @for (p of provincias; track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:100%">
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
                <input matInput type="number" formControlName="anioDesde" placeholder="2018" inputmode="numeric">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Hasta</mat-label>
                <input matInput type="number" formControlName="anioHasta" placeholder="2025" inputmode="numeric">
              </mat-form-field>
            </div>
          </div>

          <div class="filtro-grupo">
            <span class="filtro-label">Superficie (m²)</span>
            <div class="form-row-2">
              <mat-form-field appearance="outline">
                <mat-label>Mín</mat-label>
                <input matInput type="number" formControlName="m2Min" placeholder="50" inputmode="numeric">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Máx</mat-label>
                <input matInput type="number" formControlName="m2Max" placeholder="500" inputmode="numeric">
              </mat-form-field>
            </div>
          </div>

          <div class="filtro-grupo">
            <span class="filtro-label">Costo/m² (USD)</span>
            <div class="form-row-2">
              <mat-form-field appearance="outline">
                <mat-label>Mín</mat-label>
                <input matInput type="number" formControlName="costoM2Min" placeholder="300" inputmode="numeric">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Máx</mat-label>
                <input matInput type="number" formControlName="costoM2Max" placeholder="1500" inputmode="numeric">
              </mat-form-field>
            </div>
          </div>

          <button mat-raised-button color="primary" (click)="showFilters.set(false)"
                  style="width:100%;margin-top:12px;min-height:48px;font-size:0.95rem;">
            Ver resultados
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">

        <!-- Filter Toolbar -->
        <div class="filter-toolbar">
          <button class="filter-btn" [class.has-filters]="activeFiltersCount() > 0"
                  (click)="showFilters.set(true)">
            <mat-icon>tune</mat-icon>
            <span class="filter-btn-label">Filtros</span>
            @if (activeFiltersCount() > 0) {
              <span class="filter-badge">{{ activeFiltersCount() }}</span>
            }
          </button>

          @if (activeFilterChips().length > 0) {
            <div class="active-chips">
              @for (chip of activeFilterChips(); track chip.key) {
                <span class="filter-chip">
                  {{ chip.label }}
                  <button class="chip-remove" (click)="removeFilter(chip.key)">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
            </div>
          }

          <span class="toolbar-spacer"></span>

          <mat-form-field appearance="outline" class="sort-select">
            <mat-select formControlName="sortBy">
              <mat-option value="fechaCarga">Más recientes</mat-option>
              <mat-option value="costoPorM2">Costo/m²</mat-option>
              <mat-option value="superficieM2">Superficie</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Content body -->
        <div class="content-body">

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
            <mat-progress-bar mode="indeterminate" color="primary" style="margin-bottom:16px;"></mat-progress-bar>
          }

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
                  <span style="color:#555;font-size:0.75rem;">{{ p.fechaCarga | date:'MMM y' }}</span>
                  <button mat-icon-button style="color:#9E9E9E;" (click)="openDetail(p);$event.stopPropagation()">
                    <mat-icon>open_in_new</mat-icon>
                  </button>
                </div>

                @if (p.contacto) {
                  <div class="card-contacto" (click)="$event.stopPropagation()">
                    <div class="contacto-name">
                      <mat-icon style="font-size:14px;height:14px;width:14px;color:#4CAF50;">person</mat-icon>
                      {{ p.contacto.nombre }} {{ p.contacto.apellido }}
                      @if (p.contacto.ciudad) {
                        <span style="color:#666;"> · {{ p.contacto.ciudad }}</span>
                      }
                    </div>
                    <div class="contacto-icons">
                      @if (p.contacto.whatsapp) {
                        <a [href]="'https://wa.me/549' + p.contacto.whatsapp"
                           target="_blank" class="contacto-icon-btn" title="WhatsApp">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                      }
                      @if (p.contacto.linkedinUrl) {
                        <a [href]="p.contacto.linkedinUrl" target="_blank" class="contacto-icon-btn" title="LinkedIn">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      }
                      @if (p.contacto.instagramUrl) {
                        <a [href]="p.contacto.instagramUrl" target="_blank" class="contacto-icon-btn" title="Instagram">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                      }
                      @if (p.contacto.behanceUrl) {
                        <a [href]="p.contacto.behanceUrl" target="_blank" class="contacto-icon-btn" title="Behance">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="#1769ff"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.155 1.36-.487.36-1.054.63-1.7.8-.646.16-1.31.24-2 .24H0V4.51h6.938zm-.4 5.38c.59 0 1.07-.14 1.44-.42.367-.28.55-.72.55-1.31 0-.33-.06-.61-.18-.82-.12-.22-.29-.39-.5-.53-.21-.13-.45-.22-.72-.27-.27-.06-.55-.08-.84-.08H3.24v3.43h3.3zm.16 5.55c.31 0 .61-.03.89-.08.29-.06.54-.15.76-.3.22-.14.4-.34.53-.58.13-.24.2-.56.2-.95 0-.76-.21-1.3-.64-1.62-.43-.32-1-.48-1.72-.48H3.24v4.01h3.46zm7.56 3.14c.64 0 1.21-.14 1.72-.42.5-.28.93-.66 1.29-1.15.35-.49.62-1.06.8-1.71.17-.66.26-1.36.26-2.11 0-.75-.09-1.45-.28-2.1-.19-.64-.46-1.2-.81-1.67-.36-.48-.8-.86-1.32-1.14-.53-.28-1.12-.42-1.79-.42-.71 0-1.34.15-1.88.44-.54.3-.99.69-1.34 1.17-.35.48-.62 1.04-.8 1.68-.18.64-.27 1.31-.27 2.03 0 .74.09 1.43.26 2.08.18.65.44 1.22.79 1.7.35.49.8.87 1.34 1.16.54.28 1.17.43 1.87.43zm.43-7.82c.67 0 1.21.26 1.63.78.42.52.63 1.28.63 2.27 0 .99-.21 1.75-.63 2.27-.42.52-.96.78-1.63.78-.68 0-1.22-.26-1.64-.78-.41-.52-.62-1.28-.62-2.27 0-1 .21-1.75.62-2.27.42-.52.96-.78 1.64-.78zm0-4.39h4.96v1.27h-4.96V6.32z"/></svg>
                        </a>
                      }
                      @if (p.contacto.sitioWeb) {
                        <a [href]="p.contacto.sitioWeb" target="_blank" class="contacto-icon-btn" title="Sitio web">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="#9E9E9E"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        </a>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="card-anonimo">
                    <mat-icon style="font-size:12px;height:12px;width:12px;">visibility_off</mat-icon>
                    Anónimo
                  </div>
                }
              </div>
            }

            @if (presupuestos().length === 0 && !loading()) {
              <div class="empty-state">
                <mat-icon>search_off</mat-icon>
                <p>No hay presupuestos con esos filtros.</p>
                <button mat-button (click)="limpiarFiltros()" color="primary">Limpiar filtros</button>
              </div>
            }
          </div>

          @if (totalElements() > 0) {
            <mat-paginator
              class="desktop-paginator"
              [length]="totalElements()"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              [pageIndex]="currentPage()"
              (page)="onPageChange($event)"
              style="background:transparent;color:#9E9E9E;">
            </mat-paginator>
            <div class="mobile-paginator">
              <button mat-icon-button [disabled]="currentPage() === 0" (click)="prevPage()" style="color:#9E9E9E;">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span style="color:#9E9E9E;font-size:0.85rem;">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
              <button mat-icon-button [disabled]="currentPage() >= totalPages() - 1" (click)="nextPage()" style="color:#9E9E9E;">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          }

        </div>
      </main>
    </div>

    <!-- FAB cargar (mobile) -->
    <a class="fab-cargar" routerLink="/cargar">
      <mat-icon>add</mat-icon>
    </a>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────────── */
    .explorador-layout {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px);
      overflow: hidden;
      position: relative;
    }

    /* ── Backdrop ────────────────────────────────────────────── */
    .filtros-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(3px);
      z-index: 400;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .filtros-overlay.visible { opacity: 1; pointer-events: auto; }

    /* ── Filter Drawer ───────────────────────────────────────── */
    .filtros-panel {
      position: fixed;
      top: 64px;
      left: 0;
      bottom: 0;
      width: 300px;
      background: #1A1A1A;
      border-right: 1px solid #2A2A2A;
      z-index: 401;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      padding: 0 16px 24px;
    }
    .filtros-panel.open {
      transform: translateX(0);
      box-shadow: 8px 0 40px rgba(0,0,0,0.7);
    }

    .drawer-handle { display: none; }

    .filtros-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0 12px;
      position: sticky;
      top: 0;
      background: #1A1A1A;
      z-index: 1;
    }
    .filtros-title { font-weight: 600; font-size: 1rem; }

    .filtros-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .filtros-form mat-form-field { font-size: 0.85rem; }

    .filtro-grupo { margin-bottom: 4px; }
    .filtro-label {
      font-size: 0.72rem; color: #9E9E9E;
      text-transform: uppercase; letter-spacing: 0.5px;
      display: block; margin-bottom: 4px;
    }
    .form-row-2 { display: flex; gap: 8px; }
    .form-row-2 mat-form-field { flex: 1; }

    /* ── Filter Toolbar ──────────────────────────────────────── */
    .filter-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      background: #141414;
      border-bottom: 1px solid #1E1E1E;
      position: sticky;
      top: 0;
      z-index: 10;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: #242424;
      border: 1px solid #353535;
      border-radius: 10px;
      color: #C0C0C0;
      padding: 0 14px;
      height: 40px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .filter-btn mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .filter-btn:hover { background: #2C2C2C; border-color: #4A4A4A; }
    .filter-btn.has-filters {
      border-color: rgba(76,175,80,0.45);
      color: #66BB6A;
      background: rgba(76,175,80,0.06);
    }

    .filter-badge {
      background: #4CAF50;
      color: #fff;
      border-radius: 10px;
      padding: 0 7px;
      height: 18px;
      font-size: 0.68rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      min-width: 18px;
    }

    .active-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      flex: 1;
      overflow: hidden;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: rgba(76,175,80,0.08);
      border: 1px solid rgba(76,175,80,0.22);
      border-radius: 20px;
      padding: 3px 4px 3px 10px;
      font-size: 0.78rem;
      color: #81C784;
      white-space: nowrap;
    }
    .chip-remove {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: inherit;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      opacity: 0.65;
    }
    .chip-remove mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .chip-remove:hover { opacity: 1; background: rgba(255,255,255,0.08); }

    .toolbar-spacer { flex: 1; min-width: 8px; }

    .sort-select {
      margin: 0;
      min-width: 145px;
      max-width: 180px;
      font-size: 0.85rem;
    }
    .sort-select .mat-mdc-form-field-subscript-wrapper { display: none; }

    /* ── Main content ────────────────────────────────────────── */
    .main-content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .content-body { padding: 20px 24px; flex: 1; }

    /* ── Stats bar ───────────────────────────────────────────── */
    .stats-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 20px;
      background: #1A1A1A;
      border: 1px solid #272727;
      border-radius: 12px;
      padding: 14px 20px;
    }
    .stat-box { display: flex; flex-direction: column; min-width: 90px; }
    .stat-number { font-size: 1.3rem; font-weight: 700; color: #4CAF50; line-height: 1; }
    .stat-label { font-size: 0.68rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

    /* ── Cards ───────────────────────────────────────────────── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
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
      display: flex; align-items: center; gap: 4px;
      color: #9E9E9E; font-size: 0.8rem;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .card-location mat-icon { font-size: 14px; height: 14px; width: 14px; flex-shrink: 0; }

    .card-meta { color: #9E9E9E; font-size: 0.8rem; }
    .dot { margin: 0 4px; }

    .card-price { display: flex; align-items: baseline; gap: 4px; }
    .price-m2 { font-size: 1.7rem; font-weight: 700; color: #4CAF50; line-height: 1; }
    .price-unit { color: #9E9E9E; font-size: 0.85rem; }
    .price-total { color: #9E9E9E; font-size: 0.8rem; margin-top: -4px; }

    .card-desglose-hint {
      display: flex; align-items: center; gap: 4px;
      color: #9E9E9E; font-size: 0.75rem;
    }

    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }

    .card-contacto {
      border-top: 1px solid #2A2A2A;
      padding-top: 8px;
      font-size: 0.8rem;
    }
    .contacto-name {
      display: flex; align-items: center; gap: 4px;
      color: #B0B0B0; margin-bottom: 6px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .contacto-icons { display: flex; gap: 4px; margin-left: -4px; flex-wrap: wrap; }
    .contacto-icon-btn {
      width: 36px; height: 36px;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%; text-decoration: none;
    }
    .contacto-icon-btn:hover { background: rgba(255,255,255,0.08); }
    .contacto-icon-btn svg { display: block; }

    .card-anonimo {
      display: flex; align-items: center; gap: 4px;
      color: #555; font-size: 0.75rem;
      border-top: 1px solid #2A2A2A; padding-top: 8px;
    }

    .empty-state { text-align: center; padding: 64px 24px; color: #555; grid-column: 1/-1; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 16px; }

    /* ── Pagination ──────────────────────────────────────────── */
    .desktop-paginator { display: block; }
    .mobile-paginator { display: none; }

    /* ── FAB cargar ──────────────────────────────────────────── */
    .fab-cargar { display: none; }

    /* ── Tablet ──────────────────────────────────────────────── */
    @media (min-width: 600px) and (max-width: 959px) {
      .cards-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* ── Mobile ──────────────────────────────────────────────── */
    @media (max-width: 599px) {
      .explorador-layout {
        height: auto;
        min-height: calc(100dvh - 56px);
        overflow: visible;
      }

      /* Bottom sheet on mobile */
      .filtros-panel {
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        max-height: 82dvh;
        border-right: none;
        border-top: 1px solid #333;
        border-radius: 20px 20px 0 0;
        transform: translateY(100%);
        padding: 0 16px 32px;
      }
      .filtros-panel.open {
        transform: translateY(0);
        box-shadow: 0 -8px 40px rgba(0,0,0,0.7);
      }

      /* Drag handle pill for bottom sheet */
      .drawer-handle {
        display: block;
        width: 40px; height: 4px;
        background: #444;
        border-radius: 2px;
        margin: 12px auto 4px;
      }

      /* Filter toolbar */
      .filter-toolbar {
        padding: 10px 16px;
        gap: 8px;
        position: sticky;
        top: 56px;
        z-index: 10;
      }
      .filter-btn-label { display: none; }
      .filter-btn { padding: 0 12px; }

      .active-chips { max-width: calc(100vw - 180px); overflow-x: auto; flex-wrap: nowrap; }

      .sort-select { min-width: 120px; }

      /* Main content */
      .main-content { overflow: visible; }
      .content-body { padding: 12px 16px 90px; }

      /* Stats: horizontal scroll */
      .stats-bar {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        gap: 8px;
        padding: 0;
        background: transparent;
        border: none;
        margin-bottom: 14px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .stats-bar::-webkit-scrollbar { display: none; }
      .stat-box {
        min-width: 100px;
        flex-shrink: 0;
        background: #1A1A1A;
        border: 1px solid #272727;
        border-radius: 10px;
        padding: 10px 14px;
      }
      .stat-number { font-size: 1.15rem; }

      /* Cards */
      .cards-grid { grid-template-columns: 1fr; gap: 12px; }
      .presupuesto-card { padding: 14px; }
      .price-m2 { font-size: 1.5rem; }

      /* Pagination */
      .desktop-paginator { display: none; }
      .mobile-paginator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 16px 0;
      }

      /* FAB cargar */
      .fab-cargar {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        background: #4CAF50;
        color: #fff;
        border-radius: 50%;
        text-decoration: none;
        z-index: 200;
        box-shadow: 0 4px 16px rgba(76,175,80,0.45);
      }
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
  showFilters = signal(false);

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

  activeFiltersCount(): number {
    const v = this.filtros.value;
    return [v.tipoObra, v.provincia, v.categoriaTerminacion,
            v.anioDesde, v.anioHasta, v.m2Min, v.m2Max,
            v.costoM2Min, v.costoM2Max]
      .filter(x => x !== null && x !== undefined && x !== '').length;
  }

  activeFilterChips(): Array<{label: string, key: string}> {
    const v = this.filtros.value;
    const chips: Array<{label: string, key: string}> = [];
    if (v.tipoObra) chips.push({ label: this.tipoLabel(v.tipoObra as string), key: 'tipoObra' });
    if (v.provincia) chips.push({ label: v.provincia as string, key: 'provincia' });
    if (v.categoriaTerminacion) {
      const catMap: Record<string, string> = { BASICA: 'Básica', MEDIA: 'Media', PREMIUM: 'Premium' };
      chips.push({ label: catMap[v.categoriaTerminacion as string] || (v.categoriaTerminacion as string), key: 'categoriaTerminacion' });
    }
    if (v.anioDesde) chips.push({ label: `Desde ${v.anioDesde}`, key: 'anioDesde' });
    if (v.anioHasta) chips.push({ label: `Hasta ${v.anioHasta}`, key: 'anioHasta' });
    if (v.m2Min) chips.push({ label: `≥${v.m2Min}m²`, key: 'm2Min' });
    if (v.m2Max) chips.push({ label: `≤${v.m2Max}m²`, key: 'm2Max' });
    if (v.costoM2Min) chips.push({ label: `≥USD${v.costoM2Min}/m²`, key: 'costoM2Min' });
    if (v.costoM2Max) chips.push({ label: `≤USD${v.costoM2Max}/m²`, key: 'costoM2Max' });
    return chips;
  }

  removeFilter(key: string): void {
    const nullKeys = ['anioDesde', 'anioHasta', 'm2Min', 'm2Max', 'costoM2Min', 'costoM2Max'];
    this.filtros.patchValue({ [key]: nullKeys.includes(key) ? null : '' });
  }

  totalPages(): number {
    return Math.ceil(this.totalElements() / this.pageSize);
  }

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

  prevPage() {
    if (this.currentPage() > 0) { this.currentPage.update(p => p - 1); this.cargar(); }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) { this.currentPage.update(p => p + 1); this.cargar(); }
  }

  limpiarFiltros() { this.filtros.reset({ sortBy: 'fechaCarga' }); }

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

  tipoLabel(tipo: string): string {
    return TIPO_OBRA_LABELS[tipo as keyof typeof TIPO_OBRA_LABELS] || tipo;
  }

  catLabel(cat: string): string {
    return CATEGORIA_LABELS[cat as keyof typeof CATEGORIA_LABELS] || cat;
  }
}
