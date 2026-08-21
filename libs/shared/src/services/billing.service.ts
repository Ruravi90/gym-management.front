import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Plan, Subscription, TenantUsage, Invoice } from '../models/billing.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private apiUrl = `${environment.apiUrl}/billing`;
  constructor(private http: HttpClient) {}
  getPlans(): Observable<Plan[]> { return this.http.get<Plan[]>(`${this.apiUrl}/plans`, { withCredentials: true }); }
  updatePlan(id: number, data: Partial<Plan>): Observable<Plan> { return this.http.patch<Plan>(`${this.apiUrl}/plans/${id}`, data, { withCredentials: true }); }
  getSubscriptions(): Observable<Subscription[]> { return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions`, { withCredentials: true }); }
  getInvoices(): Observable<Invoice[]> { return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`, { withCredentials: true }); }
  createDraftInvoice(tenantId: number): Observable<Invoice> { return this.http.post<Invoice>(`${this.apiUrl}/tenants/${tenantId}/invoices`, {}, { withCredentials: true }); }
  updateInvoiceStatus(id: number, status: string): Observable<Invoice> { return this.http.patch<Invoice>(`${this.apiUrl}/invoices/${id}/status`, { status }, { withCredentials: true }); }
  getTenantSubscription(tenantId: number): Observable<Subscription> { return this.http.get<Subscription>(`${this.apiUrl}/tenants/${tenantId}/subscription`, { withCredentials: true }); }
  assignTenantSubscription(tenantId: number, planId: number): Observable<Subscription> { return this.http.put<Subscription>(`${this.apiUrl}/tenants/${tenantId}/subscription`, { plan_id: planId }, { withCredentials: true }); }
  getTenantUsage(tenantId: number): Observable<TenantUsage> { return this.http.get<TenantUsage>(`${this.apiUrl}/tenants/${tenantId}/usage`, { withCredentials: true }); }
  cancelSubscription(tenantId: number): Observable<Subscription> { return this.http.post<Subscription>(`${this.apiUrl}/tenants/${tenantId}/subscription/cancel`, {}, { withCredentials: true }); }
  reactivateSubscription(tenantId: number): Observable<Subscription> { return this.http.post<Subscription>(`${this.apiUrl}/tenants/${tenantId}/subscription/reactivate`, {}, { withCredentials: true }); }
}
