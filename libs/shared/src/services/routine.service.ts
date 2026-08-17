import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Routine, WorkoutSession, SetLog } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private apiUrl = `${environment.apiUrl}/routines`;

  constructor(private http: HttpClient) { }

  // ---------- Rutinas ----------
  getMyRoutines(): Observable<Routine[]> {
    return this.http.get<Routine[]>(this.apiUrl);
  }

  getAllRoutines(clientId?: number, search?: string): Observable<Routine[]> {
    let params = new HttpParams();
    if (clientId) { params = params.set('client_id', String(clientId)); }
    if (search) { params = params.set('search', search); }
    return this.http.get<Routine[]>(this.apiUrl, { params });
  }

  getRoutine(id: number): Observable<Routine> {
    return this.http.get<Routine>(`${this.apiUrl}/${id}`);
  }

  createRoutine(routine: Partial<Routine> & { client_id?: number }): Observable<Routine> {
    return this.http.post<Routine>(this.apiUrl, routine);
  }

  updateRoutine(id: number, routine: Partial<Routine>): Observable<Routine> {
    return this.http.put<Routine>(`${this.apiUrl}/${id}`, routine);
  }

  deleteRoutine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ---------- Sesiones ----------
  getMySessions(limit?: number): Observable<WorkoutSession[]> {
    let params = new HttpParams();
    if (limit) { params = params.set('limit', String(limit)); }
    return this.http.get<WorkoutSession[]>(`${this.apiUrl}/sessions`, { params });
  }

  getActiveSession(routineId: number, dayId: number): Observable<WorkoutSession | null> {
    const params = new HttpParams()
      .set('routine_id', String(routineId))
      .set('day_id', String(dayId));
    return this.http.get<WorkoutSession | null>(`${this.apiUrl}/sessions/active`, { params });
  }

  getRoutineSessions(routineId: number): Observable<WorkoutSession[]> {
    return this.http.get<WorkoutSession[]>(`${this.apiUrl}/${routineId}/sessions`);
  }

  getSession(id: number): Observable<WorkoutSession> {
    return this.http.get<WorkoutSession>(`${this.apiUrl}/sessions/${id}`);
  }

  createSession(session: { routine_id?: number; day_id?: number; notes?: string }): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(`${this.apiUrl}/sessions`, session);
  }

  updateSession(id: number, session: Partial<WorkoutSession>): Observable<WorkoutSession> {
    return this.http.put<WorkoutSession>(`${this.apiUrl}/sessions/${id}`, session);
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sessions/${id}`);
  }

  // ---------- Series ----------
  addSetLog(sessionId: number, setLog: Partial<SetLog>): Observable<SetLog> {
    return this.http.post<SetLog>(`${this.apiUrl}/sessions/${sessionId}/sets`, setLog);
  }

  updateSetLog(logId: number, setLog: Partial<SetLog>): Observable<SetLog> {
    return this.http.put<SetLog>(`${this.apiUrl}/sets/${logId}`, setLog);
  }

  deleteSetLog(logId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sets/${logId}`);
  }
}
