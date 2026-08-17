import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-result',
  template: `
    <div class="result-container">
      <div class="card result-card" [ngClass]="status">
        <div class="icon-wrapper">
          <span class="icon">{{ icon }}</span>
        </div>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <button class="btn btn-primary btn-lg" (click)="goDashboard()">Volver a mi Cuenta</button>
      </div>
    </div>
  `,
  styles: [`
    .result-container {
      padding: 3rem 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background:
        radial-gradient(50rem 35rem at 110% -10%, var(--lime-100) 0%, transparent 55%),
        var(--app-bg);
    }

    .result-card {
      padding: 3.5rem 2.5rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      text-align: center;
      max-width: 480px;
      width: 100%;
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1.75rem;
      font-size: 2.6rem;
    }
    .success .icon-wrapper { background: var(--success-bg); }
    .failure .icon-wrapper { background: var(--danger-bg); }
    .pending .icon-wrapper { background: var(--warning-bg); }

    h2 { font-size: 1.9rem; font-weight: 800; margin-bottom: 1rem; }
    p { color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; margin-bottom: 2.25rem; }
  `]
})
export class PaymentResultComponent implements OnInit {
  status: 'success' | 'failure' | 'pending' = 'success';
  title = '';
  message = '';
  icon = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Detect which route was used (success/failure/pending)
    const currentPath = this.route.snapshot.url[0]?.path;

    if (currentPath === 'success') {
      this.status = 'success';
      this.icon = '✅';
      this.title = '¡Pago Exitoso!';
      this.message = 'Tu membresía ha sido activada correctamente. Ya puedes disfrutar de todas nuestras instalaciones.';
    } else if (currentPath === 'failure') {
      this.status = 'failure';
      this.icon = '❌';
      this.title = 'Pago Fallido';
      this.message = 'No se pudo procesar tu pago. Por favor, verifica tus datos o intenta con otro método de pago.';
    } else {
      this.status = 'pending';
      this.icon = '⏳';
      this.title = 'Estamos Pendientes';
      this.message = 'Mercado Pago está procesando tu transacción. Tu membresía se activará automáticamente en cuanto se confirme.';
    }
  }

  goDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
