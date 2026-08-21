import { Component } from '@angular/core';
import { BillingService, Plan } from '@shared';

@Component({ selector: 'app-platform-plans', templateUrl: './platform-plans.component.html', styleUrls: ['./platform-plans.component.css'] })
export class PlatformPlansComponent {
  plans: Plan[] = [];
  loading = true;
  editingPlan: Plan | null = null;
  saving = false;
  error = '';
  page = 1;
  pageSize = 12;
  constructor(private billingService: BillingService) { this.billingService.getPlans().subscribe({ next: plans => { this.plans = plans; this.loading = false; }, error: () => this.loading = false }); }
  get pagedPlans(): Plan[] { return this.plans.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.plans.length / this.pageSize)); }
  previousPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }
  edit(plan: Plan): void { this.editingPlan = Object.assign({}, plan); this.error = ''; }
  cancel(): void { this.editingPlan = null; }
  save(): void { if (!this.editingPlan) return; this.saving = true; this.billingService.updatePlan(this.editingPlan.id, this.editingPlan).subscribe({ next: updated => { this.plans = this.plans.map(plan => plan.id === updated.id ? updated : plan); this.editingPlan = null; this.saving = false; }, error: err => { this.error = err?.error?.detail || 'No se pudo actualizar el plan.'; this.saving = false; } }); }
  get isPlanValid(): boolean { return !!this.editingPlan && this.editingPlan.monthly_price >= 0 && this.editingPlan.max_users > 0 && this.editingPlan.max_clients > 0; }
  toggleStatus(plan: Plan): void { const next = plan.status === 'active' ? 'inactive' : 'active'; if (!window.confirm(`${next === 'active' ? '¿Activar' : '¿Desactivar'} el plan ${plan.name}?`)) return; this.billingService.updatePlan(plan.id, { status: next }).subscribe({ next: updated => this.plans = this.plans.map(item => item.id === updated.id ? updated : item), error: err => this.error = err?.error?.detail || 'No se pudo cambiar el estado del plan.' }); }
}
