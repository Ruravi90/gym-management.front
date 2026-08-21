import { Component } from '@angular/core';
import { BillingService, Plan } from '@shared';

@Component({ selector: 'app-platform-plans', templateUrl: './platform-plans.component.html', styleUrls: ['./platform-plans.component.css'] })
export class PlatformPlansComponent {
  plans: Plan[] = [];
  loading = true;
  constructor(private billingService: BillingService) { this.billingService.getPlans().subscribe({ next: plans => { this.plans = plans; this.loading = false; }, error: () => this.loading = false }); }
}
