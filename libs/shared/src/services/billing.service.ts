import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Plan, Subscription } from '../models/billing.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private apiUrl = `${environment.apiUrl}/billing`;
  constructor(private http: HttpClient) {}
  getPlans(): Observable<Plan[]> { return this.http.get<Plan[]>(`${this.apiUrl}/plans`, { withCredentials: true }); }
  getTenantSubscription(tenantId: number): Observable<Subscription> { return this.http.get<Subscription>(`${this.apiUrl}/tenants/${tenantId}/subscription`, { withCredentials: true }); }
  assignTenantSubscription(tenantId: number, planId: number): Observable<Subscription> { return this.http.put<Subscription>(`${this.apiUrl}/tenants/${tenantId}/subscription`, { plan_id: planId }, { withCredentials: true }); }
}
