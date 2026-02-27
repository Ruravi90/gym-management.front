import { Component, OnInit } from '@angular/core';
import { MembershipService, MembershipType, environment } from '@shared';

declare var MercadoPago: any;

@Component({
  selector: 'app-membership-purchase',
  template: `
    <div class="purchase-container">
      <h2>Selecciona tu Membresía</h2>
      <p>Elige el plan que mejor se adapte a ti y paga con Mercado Pago</p>

      <div class="membership-grid" *ngIf="membershipTypes.length > 0; else loading">
        <div class="membership-card" *ngFor="let type of membershipTypes">
          <div class="card-header">
            <h3>{{ type.name }}</h3>
          </div>
          <div class="card-body">
            <p class="price">$ {{ type.price | number:'1.2-2' }} MXN</p>
            <p class="description">{{ type.description }}</p>
            <div class="details-list">
              <p class="details" *ngIf="type.duration_days"><i class="icon-calendar"></i> Duración: {{ type.duration_days }} días</p>
              <p class="details" *ngIf="type.accesses_allowed"><i class="icon-check"></i> Asistencias: {{ type.accesses_allowed }}</p>
              <p class="details" *ngIf="!type.accesses_allowed"><i class="icon-check"></i> Asistencias ilimitadas</p>
            </div>
          </div>
          <div class="card-footer">
            <button (click)="buyMembership(type.id)" [disabled]="loadingPurchase">
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
        <p><i class="icon-lock"></i> Pagos seguros procesados por Mercado Pago</p>
      </div>
    </div>
  `,
  styles: [`
    .purchase-container { padding: 3rem 1rem; max-width: 1000px; margin: 0 auto; text-align: center; font-family: 'Inter', sans-serif; }
    h2 { font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
    p { color: #64748b; font-size: 1.1rem; }
    
    .membership-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
      gap: 2rem; 
      margin-top: 3.5rem; 
      padding-bottom: 2rem;
    }
    
    .membership-card { 
      background: white; 
      border-radius: 1.5rem; 
      box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid #f1f5f9;
    }
    
    .membership-card:hover { 
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -6px rgb(0 0 0 / 0.1);
    }
    
    .card-header { padding: 2rem 1.5rem 1rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
    .card-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .card-body { padding: 2rem 1.5rem; flex-grow: 1; display: flex; flex-direction: column; }
    .price { font-size: 2.5rem; font-weight: 800; color: #0f172a; margin: 0 0 1.5rem; }
    .description { color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; min-height: 3rem; }
    
    .details-list { text-align: left; border-top: 1px solid #f1f5f9; pt: 1.5rem; }
    .details { font-size: 0.9rem; color: #475569; margin-bottom: 0.75rem; display: flex; align-items: center; }
    .details i { margin-right: 0.5rem; color: #10b981; }
    
    .card-footer { padding: 1.5rem; }
    button { 
      width: 100%;
      background: #009ee3; 
      color: white; 
      padding: 1rem; 
      border-radius: 1rem; 
      border: none; 
      font-weight: 700; 
      font-size: 1rem;
      cursor: pointer; 
      transition: background 0.2s, transform 0.1s;
      box-shadow: 0 4px 6px -1px rgba(0, 158, 227, 0.4);
    }
    
    button:hover { background: #0081bb; transform: scale(1.02); }
    button:active { transform: scale(0.98); }
    button:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }
    
    .loading-state { padding: 5rem 0; color: #64748b; }
    .spinner { 
      border: 4px solid #f3f3f3; 
      border-top: 4px solid #009ee3; 
      border-radius: 50%; 
      width: 40px; 
      height: 40px; 
      animation: spin 1s linear infinite; 
      margin: 0 auto 1rem;
    }
    
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .secure-payment { margin-top: 4rem; opacity: 0.7; font-size: 0.85rem; }
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
