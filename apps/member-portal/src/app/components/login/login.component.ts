import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="auth-logo">
            <img src="assets/icons/icon-member-192.png" alt="MyGym" class="auth-logo-image">
          </div>
          <h1>MyGym</h1>
          <p>Portal del Socio</p>
        </div>
        <form (ngSubmit)="onLogin()">
          <label class="field">
            Email
            <input type="email" class="app-input" [(ngModel)]="email" name="email" placeholder="tu@email.com" required>
          </label>
          <label class="field">
            Contraseña
            <div class="password-field">
              <input [type]="showPassword ? 'text' : 'password'" class="app-input" [(ngModel)]="password" name="password" placeholder="••••••••" required>
              <button type="button" class="password-toggle" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"><svg viewBox="0 0 24 24" aria-hidden="true"><path *ngIf="!showPassword" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle *ngIf="!showPassword" cx="12" cy="12" r="2.5"/><path *ngIf="showPassword" d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-3.2 3.7M6.2 6.2C3.6 7.8 2 12 2 12s3.5 6 10 6c1.8 0 3.3-.4 4.6-1.1"/></svg></button>
            </div>
          </label>
          <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="loading">
            {{ loading ? 'Iniciando...' : 'Entrar' }}
          </button>
          <a class="forgot-link" routerLink="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
          <p class="alert alert-success" *ngIf="registered">¡Cuenta creada! Ya puedes iniciar sesión.</p>
          <p class="alert alert-danger" *ngIf="error">{{ error }}</p>
          <p class="auth-alt">
            ¿No tienes cuenta? <a routerLink="/register">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background:
        radial-gradient(60rem 40rem at 110% -10%, var(--lime-100) 0%, transparent 55%),
        radial-gradient(50rem 35rem at -20% 110%, var(--lime-50) 0%, transparent 55%),
        var(--app-bg);
    }
    .auth-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
    }
    .auth-brand { text-align: center; margin-bottom: 2rem; }
    .auth-logo {
      width: 52px;
      height: 52px;
      margin: 0 auto 1rem;
      background: var(--app-primary);
      color: var(--app-on-primary);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }
    .auth-logo-svg {
      width: 28px;
      height: 28px;
      color: #1a2e05;
    }
    .auth-logo-image { width: 52px; height: 52px; object-fit: cover; border-radius: 14px; display: block; }
    .auth-brand h1 { margin: 0; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; }
    .auth-brand p { margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.95rem; }
    .auth-alt { margin-top: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.88rem; }
    .password-field { position: relative; }
    .password-field .app-input { padding-right: 5rem; }
    .password-toggle { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); border: 0; background: transparent; color: var(--lime-700); cursor: pointer; padding: 6px 4px; display:grid; place-items:center; }
    .password-toggle svg { width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .password-toggle:focus-visible { outline: 2px solid var(--app-primary); outline-offset: 2px; border-radius: 4px; }
    .forgot-link { display:block; margin:1rem auto 0; border:0; background:none; color:var(--lime-700); cursor:pointer; font:inherit; font-size:.85rem; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';
  registered = false;

  constructor(private authService: AuthService, private router: Router) {
    const params = new URLSearchParams(window.location.search);
    this.registered = params.has('registered');
  }

  onLogin() {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.authService.fetchCurrentUser().subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.router.navigate(['/dashboard'])
        });
      },
      error: (err) => {
        this.error = 'Credenciales no válidas';
        this.loading = false;
      }
    });
  }

}
