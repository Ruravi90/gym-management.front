import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@shared/environments/environment';

export interface KaizenLog {
  id?: number;
  date: string;
  status: 'pending' | 'victory' | 'defeat';
  reflection?: string;
  habit_id?: number;
  created_at?: string;
}

export interface KaizenHabit {
  id?: number;
  name: string;
  reflection?: string;
  goal?: string;
  month: number;
  year: number;
  logs?: KaizenLog[];
}

export interface KaizenMedal {
  id?: number;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description: string;
  earned_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class KaizenService {
  private apiUrl = `${environment.apiUrl}/kaizen`;

  constructor(private http: HttpClient) {}

  getHabits(month: number, year: number): Observable<KaizenHabit[]> {
    return this.http.get<KaizenHabit[]>(`${this.apiUrl}/habits?month=${month}&year=${year}`);
  }

  createHabit(habit: KaizenHabit): Observable<KaizenHabit> {
    return this.http.post<KaizenHabit>(`${this.apiUrl}/habits`, habit);
  }

  updateHabit(id: number, habit: Partial<KaizenHabit>): Observable<KaizenHabit> {
    return this.http.put<KaizenHabit>(`${this.apiUrl}/habits/${id}`, habit);
  }

  deleteHabit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/habits/${id}`);
  }

  recordLog(habitId: number, date: string, status: 'pending' | 'victory' | 'defeat', reflection?: string): Observable<KaizenLog> {
    return this.http.post<KaizenLog>(`${this.apiUrl}/habits/${habitId}/logs`, { date, status, reflection });
  }

  getMedals(): Observable<KaizenMedal[]> {
    return this.http.get<KaizenMedal[]>(`${this.apiUrl}/medals`);
  }
}
