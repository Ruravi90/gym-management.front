import { Component } from '@angular/core';
import { AuditLog, AuditLogService } from '@shared';

@Component({ selector: 'app-platform-audit', templateUrl: './platform-audit.component.html', styleUrls: ['./platform-audit.component.css'] })
export class PlatformAuditComponent {
  logs: AuditLog[] = []; loading = true; entity = ''; action = ''; startDate = ''; endDate = ''; selected: AuditLog | null = null;
  constructor(private audit: AuditLogService) { this.load(); }
  load(): void { this.loading = true; this.audit.getAuditLogs({ limit: 100, entity_type: this.entity || undefined, action_type: this.action || undefined, start_date: this.startDate || undefined, end_date: this.endDate || undefined }).subscribe({ next: logs => { this.logs = logs; this.loading = false; }, error: () => this.loading = false }); }
  actionLabel(action: string): string { return ({ CREATE: 'Creación', UPDATE: 'Actualización', DELETE: 'Eliminación' } as any)[action] || action; }
}
