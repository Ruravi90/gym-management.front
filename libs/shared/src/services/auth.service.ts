import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { StorageService } from './storage.service';

import { User } from '../models/user.model';

export interface LoginResponse {
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  membership_type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    const savedUser = this.storage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
        this.storage.removeItem('currentUser');
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true
    });
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.clearSession()
    });
  }

  private clearSession(): void {
    this.storage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.storage.setItem('currentUser', JSON.stringify(user));
  }

  fetchCurrentUser(): Observable<User> {
    const storedUser = this.storage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        return of(user);
      } catch (e) {
        console.error('Error parsing stored user in fetchCurrentUser', e);
      }
    }

    return this.http.get<User>(`${environment.apiUrl}/users/me`, {
      withCredentials: true
    }).pipe(
      map(user => {
        if (user) {
          this.setCurrentUser(user);
        }
        return user;
      })
    );
  }

  fetchUserInfo(): Observable<User> {
    const storedUser = this.storage.getItem('currentUser');
    if (storedUser) {
      try {
        return of(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user in fetchUserInfo', e);
      }
    }
    return of(null as any);
  }

  refreshSession(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/refresh`, {}, { withCredentials: true });
  }
}
