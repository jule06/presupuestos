import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Presupuesto, TIPO_OBRA_LABELS, CATEGORIA_LABELS, GANO_LABELS, TIPO_CLIENTE_LABELS } from '../shared/models/presupuesto.model';

@Component({
  selector: 'app-presupuesto-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="dialog-container">
      <div mat-dialog-title class="dialog-title">
        <div>
          <span class="chip-tipo">{{ tipoLabel(data.tipoObra) }}</span>
          <span [class]="'chip-categoria ' + data.categoriaTerminacion" style="margin-left:8px;">
            {{ catLabel(data.categoriaTerminacion) }}
          </span>
        </div>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <!-- Precio destacado -->
        <div class="price-hero">
          <div>
            <div class="price-big">USD {{ data.costoPorM2 | number:'1.0-0' }}<span class="price-unit">/m²</span></div>
            <div style="color:#9E9E9E; font-size:0.9rem;">Total: USD {{ data.costoTotal | number:'1.0-0' }}</div>
          </div>
        </div>

        <mat-divider style="margin: 16px 0; border-color: #333;"></mat-divider>

        <!-- Datos de la obra -->
        <div class="detail-grid">
          <div class="detail-item">
            <mat-icon>straighten</mat-icon>
            <div>
              <div class="detail-value">{{ data.superficieM2 }} m²</div>
              <div class="detail-label">Superficie</div>
            </div>
          </div>
          <div class="detail-item">
            <mat-icon>calendar_today</mat-icon>
            <div>
              <div class="detail-value">{{ data.anioPresupuesto }}</div>
              <div class="detail-label">Año</div>
            </div>
          </div>
          <div class="detail-item">
            <mat-icon>location_on</mat-icon>
            <div>
              <div class="detail-value">{{ data.provincia }}</div>
              <div class="detail-label">{{ data.ciudad }}{{ data.barrio ? ' · ' + data.barrio : '' }}</div>
            </div>
          </div>
          <div class="detail-item">
            <mat-icon>person</mat-icon>
            <div>
              <div class="detail-value">{{ clienteLabel(data.tipoCliente!) }}</div>
              <div class="detail-label">Tipo de cliente</div>
            </div>
          </div>
          @if (data.duracionMeses) {
            <div class="detail-item">
              <mat-icon>schedule</mat-icon>
              <div>
                <div class="detail-value">{{ data.duracionMeses }} meses</div>
                <div class="detail-label">Duración estimada</div>
              </div>
            </div>
          }
          @if (data.ganoTrabajo) {
            <div class="detail-item">
              <mat-icon>{{ data.ganoTrabajo === 'SI' ? 'check_circle' : data.ganoTrabajo === 'NO' ? 'cancel' : 'help' }}</mat-icon>
              <div>
                <div class="detail-value">{{ ganoLabel(data.ganoTrabajo) }}</div>
                <div class="detail-label">¿Ganó el trabajo?</div>
              </div>
            </div>
          }
        </div>

        <!-- Desglose -->
        @if (data.desglose && hasDesglose()) {
          <mat-divider style="margin: 16px 0; border-color: #333;"></mat-divider>
          <div style="margin-bottom: 12px; font-weight: 600; font-size: 0.9rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px;">
            Desglose por rubro
          </div>
          <div class="desglose-list">
            @if (data.desglose!['estructura']) {
              <div class="desglose-item">
                <span>Estructura</span>
                <span class="desglose-value">USD {{ data.desglose!['estructura'] | number:'1.0-0' }}</span>
                <span class="desglose-pct">{{ pct(data.desglose!['estructura']) }}%</span>
              </div>
            }
            @if (data.desglose!['instalaciones']) {
              <div class="desglose-item">
                <span>Instalaciones</span>
                <span class="desglose-value">USD {{ data.desglose!['instalaciones'] | number:'1.0-0' }}</span>
                <span class="desglose-pct">{{ pct(data.desglose!['instalaciones']) }}%</span>
              </div>
            }
            @if (data.desglose!['terminaciones']) {
              <div class="desglose-item">
                <span>Terminaciones</span>
                <span class="desglose-value">USD {{ data.desglose!['terminaciones'] | number:'1.0-0' }}</span>
                <span class="desglose-pct">{{ pct(data.desglose!['terminaciones']) }}%</span>
              </div>
            }
            @if (data.desglose!['honorarios']) {
              <div class="desglose-item">
                <span>Honorarios</span>
                <span class="desglose-value">USD {{ data.desglose!['honorarios'] | number:'1.0-0' }}</span>
                <span class="desglose-pct">{{ pct(data.desglose!['honorarios']) }}%</span>
              </div>
            }
          </div>
        }

        <!-- Notas -->
        @if (data.notas) {
          <mat-divider style="margin: 16px 0; border-color: #333;"></mat-divider>
          <div style="margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px;">
            Notas
          </div>
          <div style="color: #ccc; font-size: 0.9rem; line-height: 1.6; background: #252525; padding: 12px 16px; border-radius: 8px;">
            {{ data.notas }}
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { background: var(--color-surface); color: var(--color-text); }
    .dialog-title { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 0; }

    .price-hero { display: flex; align-items: center; padding: 16px 0 8px; }
    .price-big { font-size: 2.5rem; font-weight: 800; color: #4CAF50; line-height: 1; }
    .price-unit { font-size: 1rem; color: #9E9E9E; margin-left: 4px; font-weight: 400; }

    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .detail-item { display: flex; gap: 10px; align-items: flex-start; }
    .detail-item mat-icon { color: #4CAF50; margin-top: 2px; flex-shrink: 0; }
    .detail-value { font-weight: 600; font-size: 0.95rem; }
    .detail-label { font-size: 0.75rem; color: #9E9E9E; margin-top: 2px; }

    .desglose-list { display: flex; flex-direction: column; gap: 8px; }
    .desglose-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: #252525;
      border-radius: 8px;
    }
    .desglose-item span:first-child { flex: 1; font-size: 0.9rem; }
    .desglose-value { font-weight: 600; color: #e0e0e0; }
    .desglose-pct { color: #9E9E9E; font-size: 0.8rem; min-width: 40px; text-align: right; }
  `]
})
export class PresupuestoDetailDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Presupuesto,
    private ref: MatDialogRef<PresupuestoDetailDialogComponent>
  ) {}

  close() { this.ref.close(); }

  tipoLabel(t: string) { return TIPO_OBRA_LABELS[t as keyof typeof TIPO_OBRA_LABELS] || t; }
  catLabel(c: string) { return CATEGORIA_LABELS[c as keyof typeof CATEGORIA_LABELS] || c; }
  ganoLabel(g: string) { return GANO_LABELS[g as keyof typeof GANO_LABELS] || g; }
  clienteLabel(c: string) { return TIPO_CLIENTE_LABELS[c as keyof typeof TIPO_CLIENTE_LABELS] || c; }

  hasDesglose(): boolean {
    if (!this.data.desglose) return false;
    return Object.values(this.data.desglose).some(v => !!v);
  }

  pct(valor: number): string {
    if (!this.data.costoTotal || this.data.costoTotal === 0) return '0';
    return ((valor / this.data.costoTotal) * 100).toFixed(0);
  }
}
