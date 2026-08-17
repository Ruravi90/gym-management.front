import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { BodyMeasurement } from '../models/measurement.model';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private apiUrl = `${environment.apiUrl}/measurements`;

  constructor(private http: HttpClient) { }

  getMeasurements(limit?: number, clientId?: number): Observable<BodyMeasurement[]> {
    let params = new HttpParams();
    if (limit) { params = params.set('limit', String(limit)); }
    if (clientId) { params = params.set('client_id', String(clientId)); }
    return this.http.get<BodyMeasurement[]>(this.apiUrl, { params });
  }

  saveMeasurement(measurement: Partial<BodyMeasurement>, clientId?: number): Observable<BodyMeasurement> {
    let params = new HttpParams();
    if (clientId) { params = params.set('client_id', String(clientId)); }
    return this.http.post<BodyMeasurement>(this.apiUrl, measurement, { params });
  }

  updateMeasurement(id: number, measurement: Partial<BodyMeasurement>): Observable<BodyMeasurement> {
    return this.http.put<BodyMeasurement>(`${this.apiUrl}/${id}`, measurement);
  }

  deleteMeasurement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
