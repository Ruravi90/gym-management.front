import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface TenantWhatsappStatus { session: string; status: string; active: boolean; }

@Injectable({ providedIn: 'root' })
export class TenantWhatsappService {
  private readonly url = `${environment.apiUrl}/tenant/whatsapp`;
  constructor(private http: HttpClient) {}
  getStatus(): Observable<TenantWhatsappStatus> { return this.http.get<TenantWhatsappStatus>(this.url, { withCredentials: true }); }
  connect(): Observable<TenantWhatsappStatus> { return this.http.post<TenantWhatsappStatus>(`${this.url}/connect`, {}, { withCredentials: true }); }
  getQr(): Observable<Blob> { return this.http.get(`${this.url}/qr`, { withCredentials: true, responseType: 'blob' }); }
  disconnect(): Observable<{ session: string; status: string }> { return this.http.post<{ session: string; status: string }>(`${this.url}/disconnect`, {}, { withCredentials: true }); }
}
