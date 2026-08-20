import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

export interface QRTokenResponse {
  token: string;
  expires_in: number;
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
}
