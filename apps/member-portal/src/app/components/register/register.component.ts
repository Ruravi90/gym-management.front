import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '@shared';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="auth-logo">
            <img src="assets/icons/icon-member-192.png" alt="MyGym" class="auth-logo-image">
          </div>
          <h1>MyGym</h1>
          <p>Registro de Socio</p>
        </div>
        <form (ngSubmit)="onRegister()">
          <label class="field">
            Nombre completo
            <input type="text" class="app-input" [(ngModel)]="userData.name" name="name" placeholder="Tu nombre" required>
          </label>
          <label class="field">
            Email
            <input type="email" class="app-input" [(ngModel)]="userData.email" name="email" placeholder="tu@email.com" required>
          </label>
          <label class="field">
            Teléfono (opcional)
            <input type="tel" class="app-input" [(ngModel)]="userData.phone" name="phone" placeholder="+56 9 ...">
          </label>
          <label class="field">
            Contraseña
            <input type="password" class="app-input" [(ngModel)]="userData.password" name="password" placeholder="••••••••" required>
          </label>
          <label class="field">
            Confirmar contraseña
            <input type="password" class="app-input" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="••••••••" required>
          </label>
          <button type="submit" class="btn btn-primary btn-lg btn-block" [disabled]="loading">
            {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
          </button>
          <p class="alert alert-danger" *ngIf="error">{{ error }}</p>
          <p class="auth-alt">
            ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
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
      max-width: 420px;
      padding: 2.5rem 2rem;
    }
    .auth-brand { text-align: center; margin-bottom: 1.75rem; }
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
  `]
})
export class RegisterComponent {
  userData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };
  confirmPassword = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (this.userData.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.userData).subscribe({
      next: () => {
        // After registration, auto-login or redirect to login
        this.router.navigate(['/login'], { queryParams: { registered: true } });
      },
      error: (err) => {
        this.error = 'Error al registrar usuario. El correo podría estar ya en uso.';
        this.loading = false;
      }
    });
  }
}
