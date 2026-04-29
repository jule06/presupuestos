import { Routes } from '@angular/router';
import { authGuard, accessGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'cargar',
    loadComponent: () => import('./presupuesto/nuevo-presupuesto/nuevo-presupuesto.component')
      .then(m => m.NuevoPresupuestoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'explorador',
    loadComponent: () => import('./explorador/explorador.component').then(m => m.ExploradorComponent),
    canActivate: [authGuard, accessGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
