import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Tenant, TenantCreate, TenantUpdate, TenantStats } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getTenants(status?: string): Observable<Tenant[]> {
    let url = this.apiUrl;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<Tenant[]>(url, { withCredentials: true });
  }

  getTenant(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createTenant(data: TenantCreate): Observable<Tenant> {
    return this.http.post<Tenant>(this.apiUrl, data, { withCredentials: true });
  }

  updateTenant(id: number, data: TenantUpdate): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  deleteTenant(id: number): Observable<Tenant> {
    return this.http.delete<Tenant>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getTenantStats(id: number): Observable<TenantStats> {
    return this.http.get<TenantStats>(`${this.apiUrl}/${id}/stats`, { withCredentials: true });
  }

  getTenantCount(): Observable<{ total: number; active: number }> {
    return this.http.get<{ total: number; active: number }>(`${this.apiUrl}/count`, { withCredentials: true });
  }

  assignAdmin(tenantId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${tenantId}/assign-admin`, { user_id: userId }, { withCredentials: true });
  }
}
