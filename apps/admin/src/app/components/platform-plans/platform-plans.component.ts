import { Component } from '@angular/core';
import { BillingService, Plan } from '@shared';

@Component({ selector: 'app-platform-plans', templateUrl: './platform-plans.component.html', styleUrls: ['./platform-plans.component.css'] })
export class PlatformPlansComponent {
  plans: Plan[] = [];
  loading = true;
  editingPlan: Plan | null = null;
  saving = false;
  error = '';
  constructor(private billingService: BillingService) { this.billingService.getPlans().subscribe({ next: plans => { this.plans = plans; this.loading = false; }, error: () => this.loading = false }); }
  edit(plan: Plan): void { this.editingPlan = Object.assign({}, plan); this.error = ''; }
  cancel(): void { this.editingPlan = null; }
  save(): void { if (!this.editingPlan) return; this.saving = true; this.billingService.updatePlan(this.editingPlan.id, this.editingPlan).subscribe({ next: updated => { this.plans = this.plans.map(plan => plan.id === updated.id ? updated : plan); this.editingPlan = null; this.saving = false; }, error: err => { this.error = err?.error?.detail || 'No se pudo actualizar el plan.'; this.saving = false; } }); }
  get isPlanValid(): boolean { return !!this.editingPlan && this.editingPlan.monthly_price >= 0 && this.editingPlan.max_users > 0 && this.editingPlan.max_clients > 0; }
}
