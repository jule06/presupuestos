import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../core/services/api.service';
import { Usuario } from '../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'rp_token';

  private readonly _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  readonly currentUser = signal<Usuario | null>(null);
  readonly isLoggedIn = computed(() => this._token() !== null);

  constructor(private api: ApiService, private router: Router) {}

  get token(): string | null {
    return this._token();
  }

  loginWithGoogle(idToken: string) {
    return this.api.loginGoogle(idToken).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this._token.set(res.token);
      })
    );
  }

  loadCurrentUser(): Observable<Usuario | null> {
    if (!this._token()) return of(null);
    return this.api.getMe().pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}
