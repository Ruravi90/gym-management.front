import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tenant, TenantStats, TenantService, UserService, User, AuditLogService, AuditLog, BillingService, Subscription, Plan } from '@shared';

@Component({
  selector: 'app-platform-tenant-detail',
  templateUrl: './platform-tenant-detail.component.html',
  styleUrls: ['./platform-tenant-detail.component.css']
})
export class PlatformTenantDetailComponent implements OnInit {
  tenant: Tenant | null = null;
  stats: TenantStats | null = null;
  loading = true;
  error = '';
  administrators: User[] = [];
  activity: AuditLog[] = [];
  subscription: Subscription | null = null;
  plan: Plan | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private tenantService: TenantService, private userService: UserService, private auditLogService: AuditLogService, private billingService: BillingService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = 'Tenant inválido'; this.loading = false; return; }
    this.tenantService.getTenant(id).subscribe({
      next: tenant => { this.tenant = tenant; this.loadStats(id); this.loadRelatedData(id); },
      error: () => { this.error = 'No se pudo cargar el tenant'; this.loading = false; }
    });
  }

  private loadRelatedData(id: number): void {
    this.userService.getUsers().subscribe({ next: users => this.administrators = users.filter(user => user.tenant_id === id && ['admin', 'manager'].includes(user.role)) });
    this.auditLogService.getAuditLogs({ entity_type: 'tenant', entity_id: id, limit: 10 }).subscribe({ next: logs => this.activity = logs });
    this.billingService.getTenantSubscription(id).subscribe({ next: subscription => {
      this.subscription = subscription;
      this.billingService.getPlans().subscribe({ next: plans => this.plan = plans.find(plan => plan.id === subscription.plan_id) || null });
    } });
  }

  private loadStats(id: number): void {
    this.tenantService.getTenantStats(id).subscribe({
      next: stats => { this.stats = stats; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggleStatus(): void {
    if (!this.tenant) return;
    const status = this.tenant.status === 'active' ? 'suspended' : 'active';
    this.tenantService.updateTenant(this.tenant.id, { status }).subscribe({ next: tenant => this.tenant = tenant });
  }

  statusLabel(status: string): string {
    return status === 'active' ? 'Activo' : status === 'suspended' ? 'Suspendido' : 'Inactivo';
  }

  goBack(): void { this.router.navigate(['/platform/tenants']); }
}
