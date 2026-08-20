import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MembershipType {
  id: number;
  name: string;
  duration_days: number | null;
  accesses_allowed: number | null;
  price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PunchUsage {
  total_accesses_allowed: number | null;
  accesses_used: number;
  accesses_remaining: number | null;
}

export interface Membership {
  id: number;
  client_id: number;
  membership_type_id?: number;
  type: string;
  start_date: string;
  end_date: string;
  price: number;
  price_paid?: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  accesses_used: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface MembershipWithClient extends Membership {
  client?: any;
}

export interface CreateMembershipRequest {
  client_id: number;
  membership_type_id?: number;
  type?: string;
  start_date: string;
  end_date: string;
  price: number;
  price_paid?: number;
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
  private membershipTypesApiUrl = `${environment.apiUrl}/membership-types`;
  private paymentsApiUrl = `${environment.apiUrl}/payments/create-preference`;

  constructor(private http: HttpClient) { }

  getMemberships(): Observable<Membership[]> {
    return this.http.get<Membership[]>(this.apiUrl, { withCredentials: true });
  }

  getMembership(id: number): Observable<Membership> {
    return this.http.get<Membership>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createMembership(membership: CreateMembershipRequest): Observable<Membership> {
    return this.http.post<Membership>(this.apiUrl, membership, { withCredentials: true });
  }

  updateMembership(id: number, membership: Partial<CreateMembershipRequest>): Observable<Membership> {
    return this.http.put<Membership>(`${this.apiUrl}/${id}`, membership, { withCredentials: true });
  }

  deleteMembership(id: number): Observable<Membership> {
    return this.http.delete<Membership>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getMembershipsByClient(clientId: number): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/client/${clientId}`, { withCredentials: true });
  }

  getActiveMembershipByClient(clientId: number): Observable<Membership> {
    return this.http.get<Membership>(`${this.apiUrl}/client/${clientId}/active`, { withCredentials: true });
  }

  getMembershipsByStatus(status: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/status/${status}`, { withCredentials: true });
  }

  getMembershipsByPaymentStatus(paymentStatus: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/payment-status/${paymentStatus}`, { withCredentials: true });
  }

  getMembershipHistory(clientId: number): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.apiUrl}/client/${clientId}/history`, { withCredentials: true });
  }

  getMembershipStatistics(): Observable<MembershipStatistics> {
    return this.http.get<MembershipStatistics>(`${this.apiUrl}/statistics`, { withCredentials: true });
  }

  getMembershipTypes(skip: number = 0, limit: number = 100, activeOnly: boolean = false): Observable<MembershipType[]> {
    const activeOnlyStr = activeOnly ? 'true' : 'false';
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString(), active_only: activeOnlyStr });
    return this.http.get<MembershipType[]>(`${this.membershipTypesApiUrl}?${params.toString()}`, { withCredentials: true });
  }

  getMembershipType(id: number): Observable<MembershipType> {
    return this.http.get<MembershipType>(`${this.membershipTypesApiUrl}/${id}`, { withCredentials: true });
  }

  createMembershipType(membershipType: CreateMembershipTypeRequest): Observable<MembershipType> {
    return this.http.post<MembershipType>(this.membershipTypesApiUrl, membershipType, { withCredentials: true });
  }

  updateMembershipType(id: number, membershipType: UpdateMembershipTypeRequest): Observable<MembershipType> {
    return this.http.put<MembershipType>(`${this.membershipTypesApiUrl}/${id}`, membershipType, { withCredentials: true });
  }

  deleteMembershipType(id: number): Observable<MembershipType> {
    return this.http.delete<MembershipType>(`${this.membershipTypesApiUrl}/${id}`, { withCredentials: true });
  }

  useMembershipAccess(membershipId: number): Observable<Membership> {
    return this.http.post<Membership>(`${this.apiUrl}/${membershipId}/use-access`, {}, { withCredentials: true });
  }

  getMembershipAccessUsage(membershipId: number): Observable<PunchUsage> {
    return this.http.get<PunchUsage>(`${this.apiUrl}/${membershipId}/access-usage`, { withCredentials: true });
  }

  validateClientAccess(clientId: number): Observable<ValidateAccessResponse> {
    return this.http.get<ValidateAccessResponse>(`${this.apiUrl}/validate-access/${clientId}`, { withCredentials: true });
  }

  createPaymentPreference(membershipTypeId: number): Observable<any> {
    return this.http.post<any>(this.paymentsApiUrl, { membership_type_id: membershipTypeId }, { withCredentials: true });
  }
}
