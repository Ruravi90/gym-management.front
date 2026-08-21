import { Component } from '@angular/core';
import { BillingService, Invoice } from '@shared';

@Component({ selector: 'app-platform-invoices', templateUrl: './platform-invoices.component.html', styleUrls: ['./platform-invoices.component.css'] })
export class PlatformInvoicesComponent {
  invoices: Invoice[] = []; loading = true; status = '';
  constructor(private billing: BillingService) { this.billing.getInvoices().subscribe({ next: items => { this.invoices = items; this.loading = false; }, error: () => this.loading = false }); }
  get filtered(): Invoice[] { return this.invoices.filter(item => !this.status || item.status === this.status); }
  statusLabel(status: string): string { return ({ draft: 'Borrador', open: 'Abierta', paid: 'Pagada', void: 'Anulada', uncollectible: 'Incobrable' } as any)[status] || status; }
}
