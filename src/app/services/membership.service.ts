import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Membership {
  id: number;
  client_id: number;
  type: string;
  start_date: string;
  end_date: string;
  price: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateMembershipRequest {
  client_id: number;
  type: string;
  start_date: string;
  end_date: string;
  price: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  notes?: string;
}

export interface MembershipStatistics {
  total_memberships: number;
  active_memberships: number;
  expired_memberships: number;
  upcoming_expirations: number;
  upcoming_expirations_list: Membership[];
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private apiUrl = 'http://localhost:8000/memberships';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getMemberships(): Observable<Membership[]> {
    return this.http.get<Membership[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getMembership(id: number): Observable<Membership> {
    return this.http.get<Membership>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createMembership(membership: CreateMembershipRequest): Observable<Membership> {
    return this.http.post<Membership>(this.apiUrl, membership, { headers: this.getAuthHeaders() });
  }

  updateMembership(id: number, membership: Partial<CreateMembershipRequest>): Observable<Membership> {
    return this.http.put<Membership>(`${this.apiUrl}/${id}`, membership, { headers: this.getAuthHeaders() });
  }

  deleteMembership(id: number): Observable<Membership> {
    return this.http.delete<Membership>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getMembershipsByClient(clientId: number): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/client/${clientId}`, { headers: this.getAuthHeaders() });
  }

  getActiveMembershipByClient(clientId: number): Observable<Membership> {
    return this.http.get<Membership>(`${this.apiUrl}/client/${clientId}/active`, { headers: this.getAuthHeaders() });
  }

  getMembershipsByStatus(status: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/status/${status}`, { headers: this.getAuthHeaders() });
  }

  getMembershipsByPaymentStatus(paymentStatus: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/payment-status/${paymentStatus}`, { headers: this.getAuthHeaders() });
  }

  getMembershipHistory(clientId: number): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/client/${clientId}/history`, { headers: this.getAuthHeaders() });
  }

  getMembershipStatistics(): Observable<MembershipStatistics> {
    return this.http.get<MembershipStatistics>(`${this.apiUrl}/statistics`, { headers: this.getAuthHeaders() });
  }
}