import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '@shared';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>GymControl</h1>
        <p>Registro de Socio</p>
        <form (ngSubmit)="onRegister()">
          <input type="text" [(ngModel)]="userData.name" name="name" placeholder="Nombre completo" required>
          <input type="email" [(ngModel)]="userData.email" name="email" placeholder="Email" required>
          <input type="tel" [(ngModel)]="userData.phone" name="phone" placeholder="Teléfono (opcional)">
          <input type="password" [(ngModel)]="userData.password" name="password" placeholder="Contraseña" required>
          <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirmar contraseña" required>
          
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
          </button>
          
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="login-link">
            ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; padding: 1rem; }
    .register-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 100%; max-width: 400px; text-align: center; }
    input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    button { width: 100%; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
    button:disabled { background: #94a3b8; }
    .error { color: #ef4444; margin-top: 1rem; }
    .login-link { margin-top: 1.5rem; color: #64748b; font-size: 0.875rem; }
    a { color: #6366f1; text-decoration: none; font-weight: 600; }
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
