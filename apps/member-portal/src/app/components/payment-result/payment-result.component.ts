import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-result',
  template: `
    <div class="result-container">
      <div class="result-card" [ngClass]="status">
        <div class="icon-wrapper">
          <span class="icon">{{ icon }}</span>
        </div>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <button (click)="goDashboard()">Volver a mi Cuenta</button>
      </div>
    </div>
  `,
  styles: [`
    .result-container { 
      padding: 4rem 1rem; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 80vh; 
      background: #f8fafc;
      font-family: 'Inter', sans-serif;
    }
    
    .result-card { 
      background: white; 
      padding: 4rem 3rem; 
      border-radius: 2.5rem; 
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 10px 10px -6px rgb(0 0 0 / 0.05);
      text-align: center; 
      max-width: 480px; 
      width: 100%;
      border: 1px solid #f1f5f9;
    }
    
    .icon-wrapper { 
      width: 80px; 
      height: 80px; 
      border-radius: 50%; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      margin: 0 auto 2rem;
      font-size: 3rem;
    }
    
    .success .icon-wrapper { background: #ecfdf5; }
    .failure .icon-wrapper { background: #fef2f2; }
    .pending .icon-wrapper { background: #fffbeb; }
    
    h2 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem; }
    p { color: #64748b; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.5rem; }
    
    button { 
      background: #0f172a; 
      color: white; 
      padding: 1rem 2.5rem; 
      border-radius: 1rem; 
      border: none; 
      font-weight: 700; 
      font-size: 1.1rem;
      cursor: pointer; 
      transition: transform 0.2s, background 0.2s;
    }
    
    button:hover { background: #1e293b; transform: scale(1.02); }
    button:active { transform: scale(0.98); }
    
    .success .icon { content: '✅'; }
    .failure .icon { content: '❌'; }
    .pending .icon { content: '⏳'; }
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
