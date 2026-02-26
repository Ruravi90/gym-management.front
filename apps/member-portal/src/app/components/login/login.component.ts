import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>GymControl</h1>
        <p>Portal del Socio</p>
        <form (ngSubmit)="onLogin()">
          <input type="email" [(ngModel)]="email" name="email" placeholder="Email" required>
          <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required>
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Iniciando...' : 'Entrar' }}
          </button>
          <p class="success" *ngIf="registered">¡Cuenta creada! Ya puedes iniciar sesión.</p>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="register-link">
            ¿No tienes cuenta? <a routerLink="/register">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc; }
    .login-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 100%; max-width: 400px; text-align: center; }
    input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    button { width: 100%; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
    .error { color: #ef4444; margin-top: 1rem; }
    .success { color: #22c55e; margin-top: 1rem; font-size: 0.875rem; }
    .register-link { margin-top: 1.5rem; color: #64748b; font-size: 0.875rem; }
    a { color: #6366f1; text-decoration: none; font-weight: 600; }
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
