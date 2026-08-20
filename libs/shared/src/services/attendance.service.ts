import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) { }

  checkIn(image: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', image, 'checkin.jpg');
    return this.http.post(`${this.apiUrl}/check-in`, formData, { withCredentials: true });
  }

  getAttendanceHistory(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/client/${clientId}`, { withCredentials: true });
  }

  checkInManual(clientId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/manual/${clientId}`, {}, { withCredentials: true });
  }

  qrCheckIn(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/qr-check-in`, { token }, { withCredentials: true });
  }

  pinCheckIn(pin: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pin-check-in`, { pin }, { withCredentials: true });
  }
}
