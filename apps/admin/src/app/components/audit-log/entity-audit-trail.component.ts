import { Component, Input, OnInit } from '@angular/core';
import { AuditLogService, AuditLog } from '@shared';

@Component({
  selector: 'app-entity-audit-trail',
  templateUrl: './entity-audit-trail.component.html',
  styleUrls: ['./entity-audit-trail.component.css']
})
export class EntityAuditTrailComponent implements OnInit {
  @Input() entityType: string = '';
  @Input() entityId: number = 0;
  
  auditLogs: AuditLog[] = [];
  loading = false;
  error: string | null = null;

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    if (this.entityType && this.entityId) {
      this.loadAuditTrail();
    }
  }

  ngOnChanges(): void {
    if (this.entityType && this.entityId) {
      this.loadAuditTrail();
    }
  }

  loadAuditTrail(): void {
    if (!this.entityType || !this.entityId) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.auditLogService.getAuditLogsByEntity(this.entityType, this.entityId).subscribe({
      next: (logs) => {
        this.auditLogs = logs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error loading audit trail for ${this.entityType}:${this.entityId}`, err);
        this.error = `Error loading audit trail: ${err.message}`;
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getChangedFields(log: AuditLog): Array<{key: string, oldValue: any, newValue: any}> {
    if (!log.old_values && !log.new_values) return [];

    const allKeys = new Set([
      ...(log.old_values ? Object.keys(log.old_values) : []),
      ...(log.new_values ? Object.keys(log.new_values) : [])
    ]);

    const changes: Array<{key: string, oldValue: any, newValue: any}> = [];

    allKeys.forEach(key => {
      const oldValue = log.old_values?.[key];
      const newValue = log.new_values?.[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ key, oldValue, newValue });
      }
    });

    return changes;
  }

  getOldValueDisplay(key: string, value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  getNewValueDisplay(key: string, value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}