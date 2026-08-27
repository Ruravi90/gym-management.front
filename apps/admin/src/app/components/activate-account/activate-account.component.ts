import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@shared';

@Component({
  selector: 'app-admin-activate-account',
  template: `<main class="auth-page"><section class="auth-card"><h1>Cambiar contraseña</h1><p>Define una contraseña nueva para tu cuenta administrativa.</p><form (ngSubmit)="submit()"><input class="app-input" type="password" [(ngModel)]="password" name="password" minlength="6" placeholder="Nueva contraseña" required><input class="app-input" type="password" [(ngModel)]="confirmation" name="confirmation" minlength="6" placeholder="Repite la contraseña" required><button class="app-btn app-btn-primary" [disabled]="loading">{{loading ? 'Guardando...' : 'Guardar contraseña'}}</button><p class="message error" *ngIf="error">{{error}}</p><p class="message success" *ngIf="success">{{success}}</p></form></section></main>`,
  styles: [`.auth-page{min-height:100vh;display:grid;place-items:center;padding:1rem;background:var(--app-bg)}.auth-card{width:min(420px,100%);padding:2rem;background:var(--app-surface);border:1px solid var(--app-border);border-radius:16px;box-shadow:var(--shadow-lg)}.app-input{display:block;width:100%;box-sizing:border-box;margin:1rem 0;padding:.8rem}.message{margin-top:1rem}.error{color:var(--app-danger)}.success{color:var(--app-success)}`]
})
export class ActivateAccountComponent {
  password = ''; confirmation = ''; loading = false; error = ''; success = '';
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}
  submit(): void { const reset = this.route.snapshot.queryParamMap.get('reset') || ''; if (this.password.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres'; return; } if (this.password !== this.confirmation) { this.error = 'Las contraseñas no coinciden'; return; } this.loading = true; this.http.post(`${environment.apiUrl}/auth/set-password`, { reset, password: this.password }).subscribe({ next: () => { this.success = 'Contraseña actualizada. Ya puedes iniciar sesión.'; this.loading = false; setTimeout(() => this.router.navigate(['/login']), 1800); }, error: e => { this.error = e.error?.detail || 'No se pudo actualizar la contraseña'; this.loading = false; } }); }
}
