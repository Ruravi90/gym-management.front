import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MentorReply {
  reply: string;
  provider?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private apiUrl = `${environment.apiUrl}/mentor`;

  constructor(private http: HttpClient) { }

  chat(message: string): Observable<MentorReply> {
    return this.http.post<MentorReply>(`${this.apiUrl}/chat`, { message });
  }

  weeklyCheckin(): Observable<MentorReply> {
    return this.http.post<MentorReply>(`${this.apiUrl}/weekly-checkin`, {});
  }
}
