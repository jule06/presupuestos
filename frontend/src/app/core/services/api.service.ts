import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Presupuesto, PageResult, Estadisticas } from '../../shared/models/presupuesto.model';
import { Usuario } from '../../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Auth
  loginGoogle(idToken: string): Observable<{ token: string; esNuevo: boolean; accesoDesbloqueado: boolean }> {
    return this.http.post<any>(`${this.base}/auth/google`, { idToken });
  }

  register(data: { nombre: string; apellido: string; email: string; password: string }): Observable<{ verificationRequired: boolean }> {
    return this.http.post<{ verificationRequired: boolean }>(`${this.base}/auth/register`, data);
  }

  loginLocal(email: string, password: string): Observable<{ token: string; esNuevo: boolean; accesoDesbloqueado: boolean }> {
    return this.http.post<any>(`${this.base}/auth/login`, { email, password });
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.get<void>(`${this.base}/auth/verify-email`, { params: { token } });
  }

  resendVerification(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/reset-password`, { token, newPassword });
  }

  // Usuario
  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/usuarios/me`);
  }

  updatePerfil(data: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/usuarios/me`, data);
  }

  // Presupuestos
  crearPresupuesto(data: any): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${this.base}/presupuestos`, data);
  }

  listarPresupuestos(filtros: any, page = 0, size = 20, sortBy = 'fechaCarga', sortDir = 'desc'): Observable<PageResult<Presupuesto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, String(v));
      }
    });

    return this.http.get<PageResult<Presupuesto>>(`${this.base}/presupuestos`, { params });
  }

  getEstadisticas(filtros: any): Observable<Estadisticas> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<Estadisticas>(`${this.base}/presupuestos/estadisticas`, { params });
  }

  getPreview(): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(`${this.base}/presupuestos/preview`);
  }

  getTotalCount(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.base}/presupuestos/count`);
  }

  getMisPresupuestos(): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(`${this.base}/presupuestos/mis`);
  }

  eliminarPresupuesto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/presupuestos/${id}`);
  }
}
