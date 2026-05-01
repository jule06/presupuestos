import { Routes } from '@angular/router';
import { authGuard, accessGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth-page.component').then(m => m.AuthPageComponent)
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./auth/verify-email-callback.component').then(m => m.VerifyEmailCallbackComponent)
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./auth/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'auth/verify-pending',
    loadComponent: () => import('./auth/verify-email-pending.component').then(m => m.VerifyEmailPendingComponent)
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
