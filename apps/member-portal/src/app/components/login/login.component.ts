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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="auth-logo-svg">
              <path d="M2 13h3l2-4 3 8 2-6 2 2h5"/>
            </svg>
          </div>
          <h1>PULSE</h1>
          <p>Portal del Socio</p>
        </div>
        <form (ngSubmit)="onLogin()">
          <label class="field">
            Email
            <input type="email" class="app-input" [(ngModel)]="email" name="email" placeholder="tu@email.com" required>
          </label>
          <label class="field">
            Contraseña
            <input type="password" class="app-input" [(ngModel)]="password" name="password" placeholder="••••••••" required>
          </label>
          <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="loading">
            {{ loading ? 'Iniciando...' : 'Entrar' }}
          </button>
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
    .auth-brand h1 { margin: 0; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; }
    .auth-brand p { margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.95rem; }
    .auth-alt { margin-top: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.88rem; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
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
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = 'Credenciales no válidas';
        this.loading = false;
      }
    });
  }
}
