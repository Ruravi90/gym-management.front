import { Component } from '@angular/core';
import { BillingService, Invoice } from '@shared';

@Component({ selector: 'app-platform-invoices', templateUrl: './platform-invoices.component.html', styleUrls: ['./platform-invoices.component.css'] })
export class PlatformInvoicesComponent {
  invoices: Invoice[] = []; loading = true; status = ''; generating = false; error = ''; page = 1; pageSize = 20;
  constructor(private billing: BillingService) { this.billing.getInvoices().subscribe({ next: items => { this.invoices = items; this.loading = false; }, error: () => this.loading = false }); }
  get filtered(): Invoice[] { return this.invoices.filter(item => !this.status || item.status === this.status); }
  get pagedInvoices(): Invoice[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  applyFilter(): void { this.page = 1; }
  previousPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }
  statusLabel(status: string): string { return ({ draft: 'Borrador', open: 'Abierta', paid: 'Pagada', void: 'Anulada', uncollectible: 'Incobrable' } as any)[status] || status; }
  generateFor(tenantId: number): void { if (!window.confirm('¿Generar una factura en borrador para este tenant?')) return; this.generating = true; this.error = ''; this.billing.createDraftInvoice(tenantId).subscribe({ next: invoice => { this.invoices = [invoice, ...this.invoices]; this.generating = false; }, error: err => { this.error = err?.error?.detail || 'No se pudo generar la factura.'; this.generating = false; } }); }
  changeStatus(invoice: Invoice, next: string): void { if (!window.confirm(`${next === 'open' ? '¿Abrir' : '¿Anular'} esta factura?`)) return; this.billing.updateInvoiceStatus(invoice.id, next).subscribe({ next: updated => this.invoices = this.invoices.map(item => item.id === updated.id ? updated : item), error: err => this.error = err?.error?.detail || 'No se pudo actualizar la factura.' }); }
}
