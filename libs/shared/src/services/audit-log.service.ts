import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AuditLog {
  id: number;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  user_id: number | null;
  entity_type: string;
  entity_id: number;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AuditLogFilter {
  skip?: number;
  limit?: number;
  user_id?: number;
  entity_type?: string;
  entity_id?: number;
  action_type?: string;
  start_date?: string;
  end_date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) { }

  getAuditLogs(filters: AuditLogFilter = {}): Observable<AuditLog[]> {
    let params = new HttpParams();

    if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());
    if (filters.limit !== undefined) params = params.set('limit', filters.limit.toString());
    if (filters.user_id) params = params.set('user_id', filters.user_id.toString());
    if (filters.entity_type) params = params.set('entity_type', filters.entity_type);
    if (filters.entity_id) params = params.set('entity_id', filters.entity_id.toString());
    if (filters.action_type) params = params.set('action_type', filters.action_type);
    if (filters.start_date) params = params.set('start_date', filters.start_date);
    if (filters.end_date) params = params.set('end_date', filters.end_date);

    return this.http.get<AuditLog[]>(this.apiUrl, { params, withCredentials: true });
  }

  getAuditLogById(id: number): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getAuditLogsByEntity(entityType: string, entityId: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/entity/${entityType}/${entityId}`, { withCredentials: true });
  }

  getAuditLogsByUser(userId: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/user/${userId}`, { withCredentials: true });
  }
}
