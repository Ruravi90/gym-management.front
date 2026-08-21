import { Component } from '@angular/core';
import { BillingService, Subscription } from '@shared';

@Component({ selector: 'app-platform-subscriptions', templateUrl: './platform-subscriptions.component.html', styleUrls: ['./platform-subscriptions.component.css'] })
export class PlatformSubscriptionsComponent {
  subscriptions: Subscription[] = [];
  loading = true;
  constructor(private billingService: BillingService) { this.billingService.getSubscriptions().subscribe({ next: items => { this.subscriptions = items; this.loading = false; }, error: () => this.loading = false }); }
  statusLabel(status: string): string { return ({ trialing: 'En prueba', active: 'Activa', past_due: 'Pago pendiente', canceled: 'Cancelada', suspended: 'Suspendida' } as any)[status] || status; }
}
