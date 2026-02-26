import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface TimeSeriesData {
  name: string;
  value: number;
}

export interface DashboardAnalytics {
  attendance_history: { date: string, value: number }[];
  revenue_history: { date: string, value: number }[];
  membership_distribution: { name: string, value: number }[];
  active_clients_count: number;
  total_revenue_month: number;
  check_ins_today: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) { }

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(`${this.apiUrl}/dashboard`);
  }

  getAnalyticsSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }
}
