import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@shared/environments/environment';
import {
  XpLog,
  ProgressSummary,
  Achievement,
  GamificationDashboard,
  WeeklyChallenge
} from '@shared/models/gamification.model';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private apiUrl = `${environment.apiUrl}/gamification`;

  constructor(private http: HttpClient) {}

  getProgress(): Observable<ProgressSummary> {
    return this.http.get<ProgressSummary>(`${this.apiUrl}/progress`);
  }

  getXpHistory(limit: number = 20, offset: number = 0): Observable<XpLog[]> {
    return this.http.get<XpLog[]>(`${this.apiUrl}/xp-history?limit=${limit}&offset=${offset}`);
  }

  getAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/achievements`);
  }

  getDashboard(): Observable<GamificationDashboard> {
    return this.http.get<GamificationDashboard>(`${this.apiUrl}/dashboard`);
  }

  getChallenges(): Observable<WeeklyChallenge[]> {
    return this.http.get<WeeklyChallenge[]>(`${this.apiUrl}/challenges`);
  }

  evaluateChallenges(): Observable<{ challenges: WeeklyChallenge[]; newly_completed: any[] }> {
    return this.http.post<{ challenges: WeeklyChallenge[]; newly_completed: any[] }>(`${this.apiUrl}/challenges/evaluate`, {});
  }
}
