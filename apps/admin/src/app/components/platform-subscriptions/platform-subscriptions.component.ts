import { Component } from '@angular/core';
import { BillingService, Subscription } from '@shared';

@Component({ selector: 'app-platform-subscriptions', templateUrl: './platform-subscriptions.component.html', styleUrls: ['./platform-subscriptions.component.css'] })
export class PlatformSubscriptionsComponent {
  subscriptions: Subscription[] = [];
  loading = true;
  search = '';
  status = '';
  page = 1;
  pageSize = 20;
  constructor(private billingService: BillingService) { this.billingService.getSubscriptions().subscribe({ next: items => { this.subscriptions = items; this.loading = false; }, error: () => this.loading = false }); }
  statusLabel(status: string): string { return ({ trialing: 'En prueba', active: 'Activa', past_due: 'Pago pendiente', canceled: 'Cancelada', suspended: 'Suspendida' } as any)[status] || status; }
  get filteredSubscriptions(): Subscription[] { const query = this.search.toLowerCase().trim(); return this.subscriptions.filter(item => (!this.status || item.status === this.status) && (!query || (item.tenant_name || '').toLowerCase().includes(query) || String(item.tenant_id) === query)); }
  get pagedSubscriptions(): Subscription[] { return this.filteredSubscriptions.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredSubscriptions.length / this.pageSize)); }
  applyFilter(): void { this.page = 1; }
  previousPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }
}
