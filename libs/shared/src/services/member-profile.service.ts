import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Client } from './client.service';

@Injectable({ providedIn: 'root' })
export class MemberProfileService {
  private readonly url = `${environment.apiUrl}/member/profile`;
  constructor(private http: HttpClient) {}
  get(): Observable<Client> {
    return this.http.get<Client>(this.url, { withCredentials: true }).pipe(
      catchError(() => this.http.get<Client>(`${environment.apiUrl}/member/me`, { withCredentials: true }))
    );
  }
  update(profile: Partial<Client>): Observable<Client> { return this.http.put<Client>(this.url, profile, { withCredentials: true }); }
}
