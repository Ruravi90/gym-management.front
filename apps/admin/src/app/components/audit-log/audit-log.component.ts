import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuditLogService, AuditLog, AuditLogFilter } from '@shared';
import { UserService } from '@shared';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  filteredAuditLogs: AuditLog[] = [];
  loading = false;
  error: string | null = null;

  // Filters
  filters: AuditLogFilter = {
    skip: 0,
    limit: 50
  };

  // For dropdowns
  actionTypes = ['CREATE', 'UPDATE', 'DELETE'];
  entityTypes: string[] = [];

  // Pagination
  currentPage = 0;
  itemsPerPage = 50;
  totalItems = 0;

  // For user lookup
  usersMap: Map<number, any> = new Map();

  constructor(
    private auditLogService: AuditLogService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters to handle entity-specific views
    this.route.queryParams.subscribe(params => {
      // Apply filters from query parameters if present
      if (params['entity_type']) {
        this.filters.entity_type = params['entity_type'];
      }
      if (params['entity_id']) {
        this.filters.entity_id = parseInt(params['entity_id'], 10);
      }
      if (params['user_id']) {
        this.filters.user_id = parseInt(params['user_id'], 10);
      }
      if (params['action_type']) {
        this.filters.action_type = params['action_type'];
      }
      if (params['start_date']) {
        this.filters.start_date = params['start_date'];
      }
      if (params['end_date']) {
        this.filters.end_date = params['end_date'];
      }

      // Load audit logs with the applied filters
      this.loadAuditLogs();
      this.loadUsers();
    });
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await this.userService.getUsers().toPromise();
      if (users) {
        users.forEach(user => {
          this.usersMap.set(user.id, user);
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.error = null;
    
    this.auditLogService.getAuditLogs(this.filters).subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.filteredAuditLogs = [...logs]; // Copy for client-side filtering
        this.extractEntityTypes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading audit logs:', err);
        this.error = 'Error loading audit logs';
        this.loading = false;
      }
    });
  }

  extractEntityTypes(): void {
    // Extract unique entity types from the loaded logs
    const uniqueTypes = [...new Set(this.auditLogs.map(log => log.entity_type))];
    this.entityTypes = uniqueTypes;
  }

  applyFilters(): void {
    this.currentPage = 0; // Reset to first page when applying filters
    this.loadAuditLogs();
  }

  resetFilters(): void {
    this.filters = {
      skip: 0,
      limit: 50
    };
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // In a real implementation, this would make an API call for the specific page
    // For now, we'll just update the displayed items
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getUserDisplayName(userId: number | null): string {
    if (!userId) return 'System';
    const user = this.usersMap.get(userId);
    return user ? `${user.name} (${user.email})` : `User ID: ${userId}`;
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

  // Properties for modal
  showDetailModal = false;
  selectedLog: AuditLog | null = null;

  showDetail(log: AuditLog): void {
    this.selectedLog = log;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedLog = null;
  }
}