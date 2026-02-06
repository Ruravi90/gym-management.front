import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:8000/attendance';

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

  checkIn(image: Blob): Observable<any> {
    const token = this.authService.getAccessToken();
    const formData = new FormData();
    formData.append('file', image, 'checkin.jpg');

    return this.http.post(`${this.apiUrl}/check-in`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  getAttendanceHistory(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/client/${clientId}`, { headers: this.getAuthHeaders() });
  }

  checkInManual(clientId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/manual/${clientId}`, {}, { headers: this.getAuthHeaders() });
  }
}
