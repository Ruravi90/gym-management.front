import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface MembershipType {
  id: number;
  name: string;
  duration_days: number | null;
  accesses_allowed: number | null; // null means unlimited
  price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PunchUsage {
  total_accesses_allowed: number | null; // null means unlimited
  accesses_used: number;
  accesses_remaining: number | null; // null means unlimited
}

export interface Membership {
  id: number;
  client_id: number;
  membership_type_id?: number; // New field
  type: string;
  start_date: string;
  end_date: string;
  price: number;
  price_paid?: number; // New field
  status: string;
  payment_status: string;
  payment_method?: string;
  accesses_used: number; // New field for punch tracking
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// Extended interface for UI purposes to include client data
export interface MembershipWithClient extends Membership {
  client?: any; // Client object for UI display
}

export interface CreateMembershipRequest {
  client_id: number;
  membership_type_id?: number; // New field
  type?: string; // Kept for backward compatibility
  start_date: string;
  end_date: string;
  price: number;
  price_paid?: number; // New field
  status: string;
  payment_status: string;
  payment_method?: string;
  notes?: string;
}

export interface UpdateMembershipRequest {
  status?: string;
  payment_status?: string;
  payment_method?: string;
  notes?: string;
}


export interface CreateMembershipTypeRequest {
  name: string;
  duration_days?: number | null;
  accesses_allowed?: number | null;
  price: number;
  description?: string;
  is_active: boolean;
}

export interface UpdateMembershipTypeRequest {
  name?: string;
  duration_days?: number | null;
  accesses_allowed?: number | null;
  price?: number;
  description?: string;
  is_active?: boolean;
}

export interface ValidateAccessResponse {
  valid_access: boolean;
  membership_id?: number;
  membership_type?: string;
  expires_at?: string;
  accesses_remaining?: number | null;
  message?: string;
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
  private apiUrl = `${environment.apiUrl}/memberships`;

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

  // New methods for membership types
  getMembershipTypes(skip: number = 0, limit: number = 100, activeOnly: boolean = false): Observable<MembershipType[]> {
    // Use the new dedicated endpoint for membership types
    const membershipTypesApiUrl = `${environment.apiUrl}/membership-types`;
    const activeOnlyStr = activeOnly ? 'true' : 'false';
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString(), active_only: activeOnlyStr });
    return this.http.get<MembershipType[]>(`${membershipTypesApiUrl}?${params.toString()}`, { headers: this.getAuthHeaders() });
  }

  getMembershipType(id: number): Observable<MembershipType> {
    const membershipTypesApiUrl = `${environment.apiUrl}/membership-types`;
    return this.http.get<MembershipType>(`${membershipTypesApiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createMembershipType(membershipType: CreateMembershipTypeRequest): Observable<MembershipType> {
    const membershipTypesApiUrl = `${environment.apiUrl}/membership-types`;
    return this.http.post<MembershipType>(`${membershipTypesApiUrl}`, membershipType, { headers: this.getAuthHeaders() });
  }

  updateMembershipType(id: number, membershipType: UpdateMembershipTypeRequest): Observable<MembershipType> {
    const membershipTypesApiUrl = `${environment.apiUrl}/membership-types`;
    return this.http.put<MembershipType>(`${membershipTypesApiUrl}/${id}`, membershipType, { headers: this.getAuthHeaders() });
  }

  deleteMembershipType(id: number): Observable<MembershipType> {
    const membershipTypesApiUrl = `${environment.apiUrl}/membership-types`;
    return this.http.delete<MembershipType>(`${membershipTypesApiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Enhanced membership methods
  useMembershipAccess(membershipId: number): Observable<Membership> {
    return this.http.post<Membership>(`${this.apiUrl}/${membershipId}/use-access`, {}, { headers: this.getAuthHeaders() });
  }

  getMembershipAccessUsage(membershipId: number): Observable<PunchUsage> {
    return this.http.get<PunchUsage>(`${this.apiUrl}/${membershipId}/access-usage`, { headers: this.getAuthHeaders() });
  }

  validateClientAccess(clientId: number): Observable<ValidateAccessResponse> {
    return this.http.get<ValidateAccessResponse>(`${this.apiUrl}/validate-access/${clientId}`, { headers: this.getAuthHeaders() });
  }
}