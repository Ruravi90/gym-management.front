import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

export interface QRTokenResponse {
  token: string;
  expires_in: number;
}

export interface PinResponse {
  pin: string;
  expires_in: number;
}

export interface CheckinEvent {
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMyQrToken(): Observable<QRTokenResponse> {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<QRTokenResponse>(`${this.apiUrl}/my-qr-token`, { headers });
  }

  getMyPin(): Observable<PinResponse> {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<PinResponse>(`${this.apiUrl}/my-pin`, { headers });
  }

  connectCheckinWs(clientId: number): Observable<CheckinEvent> {
    const subject = new Subject<CheckinEvent>();
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws') + `/auth/ws/checkin/${clientId}`;
    console.log('[WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WS] Connected');
    };

    ws.onmessage = (event) => {
      console.log('[WS] Message:', event.data);
      const data = JSON.parse(event.data);
      subject.next(data);
      subject.complete();
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      subject.complete();
    };

    ws.onclose = (event) => {
      console.log('[WS] Closed:', event.code, event.reason);
      subject.complete();
    };

    return subject.asObservable();
  }
}
