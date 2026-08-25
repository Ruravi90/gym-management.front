import { Component } from '@angular/core';
import { TenantService } from '@shared';

@Component({
  selector: 'app-platform-dashboard',
  templateUrl: './platform-dashboard.component.html',
  styleUrls: ['./platform-dashboard.component.css']
})
export class PlatformDashboardComponent {
  tenantCount$ = this.tenantService.getTenantCount();
  wahaStatus$ = this.tenantService.getWahaStatus();
  constructor(private tenantService: TenantService) {}
}
