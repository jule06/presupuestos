import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../auth/auth.service';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán'
];

@Component({
  selector: 'app-nuevo-presupuesto',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatRadioModule
  ],
  template: `
    <div class="container" style="padding: 40px 24px; max-width: 700px;">

      <div style="margin-bottom: 32px;">
        <h1 style="margin:0 0 8px; font-size:1.8rem; font-weight:700;">Cargá tu presupuesto</h1>
        <p style="margin:0; color:#9E9E9E;">Contribuí con la comunidad de arquitectos y diseñadores.</p>
      </div>

      <!-- Indicador de paso -->
      <div class="step-indicator">
        @for (s of [1,2,3]; track s) {
          <div class="step-dot" [class.active]="currentStep === s" [class.done]="currentStep > s">
            <span>{{ s }}</span>
          </div>
        }
        <div class="step-label">
          {{ currentStep === 1 ? 'Datos de la obra' : currentStep === 2 ? 'Números' : 'Contexto' }}
        </div>
      </div>

      <!-- PASO 1 -->
      @if (currentStep === 1) {
        <form [formGroup]="paso1" class="step-content" (submit)="$event.preventDefault()">
          <div class="form-row">
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Tipo de obra</mat-label>
              <mat-select formControlName="tipoObra">
                <mat-option value="VIVIENDA_NUEVA">Vivienda nueva</mat-option>
                <mat-option value="REFORMA_PARCIAL">Reforma parcial</mat-option>
                <mat-option value="REFORMA_INTEGRAL">Reforma integral</mat-option>
                <mat-option value="LOCAL_COMERCIAL">Local comercial</mat-option>
                <mat-option value="OFICINA">Oficina</mat-option>
                <mat-option value="OTRO">Otro</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Categoría de terminación</mat-label>
              <mat-select formControlName="categoriaTerminacion">
                <mat-option value="BASICA">Básica</mat-option>
                <mat-option value="MEDIA">Media</mat-option>
                <mat-option value="PREMIUM">Premium</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Superficie (m²)</mat-label>
              <input matInput type="number" formControlName="superficieM2" min="1">
            </mat-form-field>

            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Año del presupuesto</mat-label>
              <mat-select formControlName="anioPresupuesto">
                @for (y of years; track y) {
                  <mat-option [value]="y">{{ y }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Provincia</mat-label>
              <mat-select formControlName="provincia">
                @for (p of provincias; track p) {
                  <mat-option [value]="p">{{ p }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Ciudad</mat-label>
              <input matInput formControlName="ciudad" placeholder="Ej: Rosario">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Barrio (opcional)</mat-label>
            <input matInput formControlName="barrio" placeholder="Ej: Palermo">
          </mat-form-field>

          <div class="step-actions">
            <span></span>
            <button mat-raised-button color="primary" [disabled]="paso1.invalid" (click)="currentStep = 2">
              Siguiente <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </form>
      }

      <!-- PASO 2 -->
      @if (currentStep === 2) {
        <form [formGroup]="paso2" class="step-content" (submit)="$event.preventDefault()">
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Costo total (USD)</mat-label>
            <span matTextPrefix>USD&nbsp;</span>
            <input matInput type="number" formControlName="costoTotal" min="1">
            <mat-hint>Ingresá el total en dólares</mat-hint>
          </mat-form-field>

          @if (paso1.value.superficieM2 && paso2.value.costoTotal) {
            <div class="calc-preview">
              <mat-icon>calculate</mat-icon>
              USD {{ paso2.value.costoTotal! / paso1.value.superficieM2! | number:'1.0-0' }} / m²
            </div>
          }

          <div style="margin: 24px 0 12px;">
            <p style="margin:0 0 4px; font-weight:500;">Desglose por rubro (opcional)</p>
            <p style="margin:0; color:#9E9E9E; font-size:0.85rem;">Si tenés el detalle, ayuda mucho a la comunidad.</p>
          </div>

          <div formGroupName="desglose">
            <div class="form-row">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Estructura (USD)</mat-label>
                <input matInput type="number" formControlName="estructura" min="0">
              </mat-form-field>
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Instalaciones (USD)</mat-label>
                <input matInput type="number" formControlName="instalaciones" min="0">
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Terminaciones (USD)</mat-label>
                <input matInput type="number" formControlName="terminaciones" min="0">
              </mat-form-field>
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Honorarios (USD)</mat-label>
                <input matInput type="number" formControlName="honorarios" min="0">
              </mat-form-field>
            </div>
          </div>

          <div class="step-actions">
            <button mat-button type="button" (click)="currentStep = 1">
              <mat-icon>arrow_back</mat-icon> Anterior
            </button>
            <button mat-raised-button color="primary" [disabled]="paso2.invalid" (click)="currentStep = 3">
              Siguiente <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </form>
      }

      <!-- PASO 3 -->
      @if (currentStep === 3) {
        <form [formGroup]="paso3" class="step-content" (submit)="$event.preventDefault()">
          <div class="form-row">
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Tipo de cliente</mat-label>
              <mat-select formControlName="tipoCliente">
                <mat-option value="PARTICULAR">Particular</mat-option>
                <mat-option value="EMPRESA">Empresa</mat-option>
                <mat-option value="DESARROLLADORA">Desarrolladora</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>¿Ganaste el trabajo?</mat-label>
              <mat-select formControlName="ganoTrabajo">
                <mat-option value="SI">Sí</mat-option>
                <mat-option value="NO">No</mat-option>
                <mat-option value="NO_SABE">No sé</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Duración estimada (meses, opcional)</mat-label>
            <input matInput type="number" formControlName="duracionMeses" min="1">
          </mat-form-field>

          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Notas (opcional, máx 500 caracteres)</mat-label>
            <textarea matInput formControlName="notas" rows="3"
                      placeholder="Contexto adicional: tipo de estructura, materiales..."></textarea>
            <mat-hint align="end">{{ paso3.value.notas?.length || 0 }}/500</mat-hint>
          </mat-form-field>

          <!-- Anonimato -->
          <div class="anonimato-section">
            <p style="margin:0 0 12px; font-weight:500; color:#E0E0E0;">
              ¿Querés que te contacten por este trabajo?
            </p>

            @if (auth.currentUser()?.perfilCompleto) {
              <div class="anonimato-options">
                <div class="anonimato-option"
                     [class.selected]="paso3.value.anonimo === true"
                     (click)="paso3.patchValue({ anonimo: true })">
                  <mat-icon>visibility_off</mat-icon>
                  <div>
                    <div style="font-weight:600;">Anónimo</div>
                    <div style="color:#9E9E9E; font-size:0.8rem;">Nadie sabrá que lo cargaste vos</div>
                  </div>
                </div>
                <div class="anonimato-option"
                     [class.selected]="paso3.value.anonimo === false"
                     (click)="paso3.patchValue({ anonimo: false })">
                  <mat-icon style="color:#4CAF50;">visibility</mat-icon>
                  <div>
                    <div style="font-weight:600;">Mostrar mi contacto</div>
                    <div style="color:#9E9E9E; font-size:0.8rem;">Los usuarios podrán contactarte</div>
                  </div>
                </div>
              </div>
            } @else {
              <div class="anonimato-option selected" style="pointer-events:none; opacity:0.7;">
                <mat-icon>visibility_off</mat-icon>
                <div>
                  <div style="font-weight:600;">Anónimo</div>
                  <div style="color:#9E9E9E; font-size:0.8rem;">Nadie sabrá que lo cargaste vos</div>
                </div>
              </div>
              <div class="banner-perfil-incompleto" style="margin-top:12px;">
                <mat-icon>info</mat-icon>
                <span>
                  Para mostrar tu contacto, primero completá tu perfil con al menos una red social o sitio web.
                  <a routerLink="/perfil" style="color:#4CAF50; font-weight:600;">Ir a mi perfil</a>
                </span>
              </div>
            }
          </div>

          <div class="step-actions">
            <button mat-button type="button" (click)="currentStep = 2">
              <mat-icon>arrow_back</mat-icon> Anterior
            </button>
            <button mat-raised-button color="primary" [disabled]="paso3.invalid || loading" (click)="guardar()">
              <mat-icon>cloud_upload</mat-icon>
              {{ loading ? 'Guardando...' : 'Guardar presupuesto' }}
            </button>
          </div>
        </form>
      }

    </div>
  `,
  styles: [`
    .step-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }
    .step-dot {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 2px solid #444;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 600; color: #9E9E9E;
      transition: all 0.2s;
    }
    .step-dot.active { border-color: #4CAF50; color: #4CAF50; background: rgba(76,175,80,0.1); }
    .step-dot.done { border-color: #4CAF50; background: #4CAF50; color: #fff; }
    .step-label { color: #9E9E9E; font-size: 0.9rem; margin-left: 4px; }

    .step-content { animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    .form-row { display: flex; gap: 16px; }
    mat-form-field { margin-bottom: 4px; }

    .calc-preview {
      display: flex; align-items: center; gap: 8px;
      background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3);
      color: #4CAF50; padding: 12px 16px; border-radius: 8px;
      font-weight: 600; font-size: 1.1rem; margin: 8px 0 16px;
    }
    .step-actions {
      display: flex; justify-content: space-between; margin-top: 16px;
    }

    .anonimato-section {
      background: #1A1A1A;
      border: 1px solid #333;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .anonimato-options { display: flex; gap: 12px; flex-wrap: wrap; }
    .anonimato-option {
      flex: 1; min-width: 160px;
      display: flex; align-items: center; gap: 12px;
      border: 2px solid #333; border-radius: 8px;
      padding: 12px 16px; cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .anonimato-option:hover { border-color: #555; }
    .anonimato-option.selected { border-color: #4CAF50; background: rgba(76,175,80,0.08); }

    .banner-perfil-incompleto {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,193,7,0.08); border: 1px solid rgba(255,193,7,0.3);
      color: #FFC107; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem;
    }

    @media (max-width: 600px) {
      .form-row { flex-direction: column; }
    }
  `]
})
export class NuevoPresupuestoComponent {

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  auth = inject(AuthService);
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);

  currentStep = 1;
  loading = false;
  provincias = PROVINCIAS;
  years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);

  paso1 = this.fb.group({
    tipoObra: ['', Validators.required],
    categoriaTerminacion: ['', Validators.required],
    superficieM2: [null as number | null, [Validators.required, Validators.min(1)]],
    anioPresupuesto: [new Date().getFullYear(), Validators.required],
    provincia: ['', Validators.required],
    ciudad: ['', Validators.required],
    barrio: ['']
  });

  paso2 = this.fb.group({
    costoTotal: [null as number | null, [Validators.required, Validators.min(1)]],
    desglose: this.fb.group({
      estructura: [null as number | null],
      instalaciones: [null as number | null],
      terminaciones: [null as number | null],
      honorarios: [null as number | null]
    })
  });

  paso3 = this.fb.group({
    tipoCliente: ['', Validators.required],
    ganoTrabajo: ['', Validators.required],
    duracionMeses: [null as number | null],
    notas: ['', Validators.maxLength(500)],
    anonimo: [true as boolean]
  });

  guardar() {
    if (this.paso1.invalid || this.paso2.invalid || this.paso3.invalid) return;
    this.loading = true;

    const des = (this.paso2.get('desglose') as FormGroup).value;
    const desgloseData: Record<string, number> = {};
    if (des.estructura) desgloseData['estructura'] = des.estructura;
    if (des.instalaciones) desgloseData['instalaciones'] = des.instalaciones;
    if (des.terminaciones) desgloseData['terminaciones'] = des.terminaciones;
    if (des.honorarios) desgloseData['honorarios'] = des.honorarios;

    const payload = {
      ...this.paso1.value,
      costoTotal: this.paso2.value.costoTotal,
      tipoCliente: this.paso3.value.tipoCliente,
      ganoTrabajo: this.paso3.value.ganoTrabajo,
      duracionMeses: this.paso3.value.duracionMeses,
      notas: this.paso3.value.notas,
      anonimo: this.paso3.value.anonimo ?? true,
      desglose: Object.keys(desgloseData).length > 0 ? desgloseData : null
    };

    this.api.crearPresupuesto(payload).subscribe({
      next: () => {
        this.auth.loadCurrentUser().subscribe(() => {
          this.snackbar.open('¡Presupuesto cargado! Ya tenés acceso completo a la base.', '✓', {
            duration: 5000,
            panelClass: ['snack-success']
          });
          this.router.navigate(['/explorador']);
        });
      },
      error: () => {
        this.loading = false;
        this.snackbar.open('Error al guardar. Revisá los datos e intentá de nuevo.', 'OK', { duration: 4000 });
      }
    });
  }
}
