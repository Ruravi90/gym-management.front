import { Component, OnInit } from '@angular/core';
import { MembershipService, MembershipType, environment } from '@shared';

declare var MercadoPago: any;

@Component({
  selector: 'app-membership-purchase',
  template: `
    <div class="page-container purchase-container">
      <header class="page-header text-center">
        <h1>Selecciona tu Membresía</h1>
        <p>Elige el plan que mejor se adapte a ti y paga con Mercado Pago</p>
      </header>

      <div class="membership-grid" *ngIf="membershipTypes.length > 0; else loading">
        <div class="card membership-card" *ngFor="let type of membershipTypes">
          <div class="card-header">
            <h3>{{ type.name }}</h3>
          </div>
          <div class="card-body">
            <p class="price">$ {{ type.price | number:'1.2-2' }} <span class="currency">MXN</span></p>
            <p class="description">{{ type.description }}</p>
            <div class="details-list">
              <p class="details" *ngIf="type.duration_days">📅 Duración: {{ type.duration_days }} días</p>
              <p class="details" *ngIf="type.accesses_allowed">✅ Asistencias: {{ type.accesses_allowed }}</p>
              <p class="details" *ngIf="!type.accesses_allowed">✅ Asistencias ilimitadas</p>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-lg btn-block" (click)="buyMembership(type.id)" [disabled]="loadingPurchase">
              {{ loadingPurchase ? 'Procesando...' : 'Comprar ahora' }}
            </button>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando planes increíbles para ti...</p>
        </div>
      </ng-template>

      <div class="secure-payment">
        <p>🔒 Pagos seguros procesados por Mercado Pago</p>
      </div>
    </div>
  `,
  styles: [`
    .purchase-container { max-width: 1000px; text-align: center; }
    .page-header h1 { font-size: 2rem; }
    .page-header p { color: var(--text-muted); font-size: 1.05rem; }

    .membership-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-top: 2.5rem;
      padding-bottom: 1rem;
    }
    @media (min-width: 640px) { .membership-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); } }

    .membership-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      text-align: left;
    }
    .membership-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--app-primary-soft-border);
    }

    .card-header {
      padding: 1.5rem 1.5rem 1rem;
      background: var(--slate-50);
      border-bottom: 1px solid var(--app-border);
    }
    .card-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--slate-600); text-transform: uppercase; letter-spacing: 0.05em; }

    .card-body { padding: 1.75rem 1.5rem; flex-grow: 1; display: flex; flex-direction: column; }
    .price { font-size: 2.2rem; font-weight: 800; color: var(--text-main); margin: 0 0 1.25rem; }
    .price .currency { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }
    .description { color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.75rem; min-height: 3rem; }

    .details-list { text-align: left; border-top: 1px solid var(--app-border); padding-top: 1.25rem; }
    .details { font-size: 0.9rem; color: var(--slate-600); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem; }

    .card-footer { padding: 0 1.5rem 1.5rem; }

    .loading-state { padding: 5rem 0; color: var(--text-muted); }
    .spinner {
      border: 4px solid var(--slate-100);
      border-top: 4px solid var(--app-primary);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .secure-payment { margin-top: 3.5rem; opacity: 0.75; font-size: 0.85rem; color: var(--text-muted); }
  `]
})
export class MembershipPurchaseComponent implements OnInit {
  membershipTypes: MembershipType[] = [];
  loadingPurchase = false;

  constructor(private membershipService: MembershipService) {}

  ngOnInit() {
    this.membershipService.getMembershipTypes(0, 50, true).subscribe({
      next: (types) => this.membershipTypes = types,
      error: (err) => console.error('Error fetching membership types', err)
    });
  }

  buyMembership(typeId: number) {
    this.loadingPurchase = true;
    this.membershipService.createPaymentPreference(typeId).subscribe({
      next: (res) => {
        this.loadingPurchase = false;

        // Inicializar SDK de Mercado Pago
        const mp = new MercadoPago(environment.mpPublicKey, {
          locale: 'es-MX'
        });

        // Abrir el checkout en un modal
        mp.checkout({
          preference: {
            id: res.preference_id
          },
          autoOpen: true, // Abrir inmediatamente
        });
      },
      error: (err) => {
        this.loadingPurchase = false;
        console.error('Error creating payment preference', err);
        alert('Hubo un error al iniciar el pago. Por favor intenta de nuevo.');
      }
    });
  }
}
