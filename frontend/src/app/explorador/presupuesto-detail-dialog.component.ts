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
            <div class="price-big">ARS {{ data.costoPorM2 | number:'1.0-0' }}<span class="price-unit">/m²</span></div>
            <div style="color:#9E9E9E; font-size:0.9rem;">Total: ARS {{ data.costoTotal | number:'1.0-0' }}</div>
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
                <span class="desglose-value">ARS {{ data.desglose!['estructura'] | number:'1.0-0' }}</span>
                <span class="desglose-pct">{{ pct(data.desglose!['estructura']) }}%</span>
              </div>
            }
            @if (data.desglose!['instalaciones']) {
              <div class="desglose-item">
                <span>Instalaciones</span>
                <span class="desglose-value">ARS {{ data.desglose!['instalaciones'] | number:'1.0-0' }}</span>
                <span class="desglose-pct">{{ pct(data.desglose!['instalaciones']) }}%</span>
              </div>
            }
            @if (data.desglose!['terminaciones']) {
              <div class="desglose-item">
                <span>Terminaciones</span>
                <span class="desglose-value">ARS {{ data.desglose!['terminaciones'] | number:'1.0-0' }}</span>
                <span class="desglose-pct">{{ pct(data.desglose!['terminaciones']) }}%</span>
              </div>
            }
            @if (data.desglose!['honorarios']) {
              <div class="desglose-item">
                <span>Honorarios</span>
                <span class="desglose-value">ARS {{ data.desglose!['honorarios'] | number:'1.0-0' }}</span>
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

        <!-- Contacto -->
        <mat-divider style="margin: 16px 0; border-color: #333;"></mat-divider>
        @if (data.contacto) {
          <div style="margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #9E9E9E; text-transform: uppercase; letter-spacing: 0.5px;">
            Contacto
          </div>
          <div class="contacto-card">
            <div style="font-weight:600; margin-bottom:4px;">
              {{ data.contacto.nombre }} {{ data.contacto.apellido }}
            </div>
            @if (data.contacto.ciudad || data.contacto.provincia) {
              <div style="color:#9E9E9E; font-size:0.85rem; margin-bottom:8px;">
                {{ data.contacto.ciudad }}{{ data.contacto.ciudad && data.contacto.provincia ? ', ' : '' }}{{ data.contacto.provincia }}
              </div>
            }
            @if (data.contacto.bio) {
              <div style="color:#ccc; font-size:0.85rem; margin-bottom:10px; font-style:italic;">
                {{ data.contacto.bio }}
              </div>
            }
            <div class="contacto-links">
              @if (data.contacto.whatsapp) {
                <a [href]="'https://wa.me/549' + data.contacto.whatsapp"
                   target="_blank" class="contacto-link" style="color:#25D366;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366" style="display:block;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              }
              @if (data.contacto.linkedinUrl) {
                <a [href]="data.contacto.linkedinUrl" target="_blank" class="contacto-link" style="color:#0A66C2;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#0A66C2" style="display:block;flex-shrink:0;"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              }
              @if (data.contacto.instagramUrl) {
                <a [href]="data.contacto.instagramUrl" target="_blank" class="contacto-link" style="color:#E1306C;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#E1306C" style="display:block;flex-shrink:0;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
              }
              @if (data.contacto.behanceUrl) {
                <a [href]="data.contacto.behanceUrl" target="_blank" class="contacto-link" style="color:#1769ff;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#1769ff" style="display:block;flex-shrink:0;"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.155 1.36-.487.36-1.054.63-1.7.8-.646.16-1.31.24-2 .24H0V4.51h6.938zm-.4 5.38c.59 0 1.07-.14 1.44-.42.367-.28.55-.72.55-1.31 0-.33-.06-.61-.18-.82-.12-.22-.29-.39-.5-.53-.21-.13-.45-.22-.72-.27-.27-.06-.55-.08-.84-.08H3.24v3.43h3.3zm.16 5.55c.31 0 .61-.03.89-.08.29-.06.54-.15.76-.3.22-.14.4-.34.53-.58.13-.24.2-.56.2-.95 0-.76-.21-1.3-.64-1.62-.43-.32-1-.48-1.72-.48H3.24v4.01h3.46zm7.56 3.14c.64 0 1.21-.14 1.72-.42.5-.28.93-.66 1.29-1.15.35-.49.62-1.06.8-1.71.17-.66.26-1.36.26-2.11 0-.75-.09-1.45-.28-2.1-.19-.64-.46-1.2-.81-1.67-.36-.48-.8-.86-1.32-1.14-.53-.28-1.12-.42-1.79-.42-.71 0-1.34.15-1.88.44-.54.3-.99.69-1.34 1.17-.35.48-.62 1.04-.8 1.68-.18.64-.27 1.31-.27 2.03 0 .74.09 1.43.26 2.08.18.65.44 1.22.79 1.7.35.49.8.87 1.34 1.16.54.28 1.17.43 1.87.43zm.43-7.82c.67 0 1.21.26 1.63.78.42.52.63 1.28.63 2.27 0 .99-.21 1.75-.63 2.27-.42.52-.96.78-1.63.78-.68 0-1.22-.26-1.64-.78-.41-.52-.62-1.28-.62-2.27 0-1 .21-1.75.62-2.27.42-.52.96-.78 1.64-.78zm0-4.39h4.96v1.27h-4.96V6.32z"/></svg>
                  Behance
                </a>
              }
              @if (data.contacto.pinterestUrl) {
                <a [href]="data.contacto.pinterestUrl" target="_blank" class="contacto-link" style="color:#E60023;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#E60023" style="display:block;flex-shrink:0;"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                  Pinterest
                </a>
              }
              @if (data.contacto.sitioWeb) {
                <a [href]="data.contacto.sitioWeb" target="_blank" class="contacto-link" style="color:#9E9E9E;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#9E9E9E" style="display:block;flex-shrink:0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  Sitio web
                </a>
              }
            </div>
          </div>
        } @else {
          <div style="color:#555; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
            <mat-icon style="font-size:14px;height:14px;width:14px;">visibility_off</mat-icon>
            Presupuesto anónimo
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

    .contacto-card {
      background: #252525; border-radius: 10px; padding: 14px 16px;
    }
    .contacto-links { display: flex; flex-wrap: wrap; gap: 8px; }
    .contacto-link {
      display: inline-flex; align-items: center; gap: 4px;
      text-decoration: none; font-size: 0.82rem; font-weight: 500;
      background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 20px;
    }
    .contacto-link:hover { background: rgba(255,255,255,0.1); }
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
