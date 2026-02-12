import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;  // Role in the system (admin, receptionist, etc.)
  status: boolean;
  created_at: string;
  profile_image?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
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
    // Check if user is already logged in from storage
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).pipe(
      tap(response => {
        console.log('Login response received, storing token...');
        // Store token in storage
        this.storage.setItem('accessToken', response.access_token);
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    console.log('Executing logout - clearing storage');
    this.storage.removeItem('accessToken');
    this.storage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.storage.getItem('accessToken');
    return !!token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    console.log('Setting current user', user);
    this.currentUserSubject.next(user);
    this.storage.setItem('currentUser', JSON.stringify(user));
  }

  getAccessToken(): string | null {
    return this.storage.getItem('accessToken');
  }

  // Method to get user info after login
  fetchCurrentUser(): Observable<User> {
    const token = this.getAccessToken();
    if (!token) {
      console.warn('FetchCurrentUser called without token');
      return of(null as any);
    }

    // If we already have a stored user, return it
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

    // Otherwise fetch from API (/users/me)
    console.log('Fetching user info from API...');
    return this.http.get<User>(`${environment.apiUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(user => {
        if (user) {
          this.setCurrentUser(user);
        }
        return user;
      })
    );
  }

  // Method to fetch user info from API
  fetchUserInfo(): Observable<User> {
    const token = this.getAccessToken();
    if (!token) {
      return of(null as any);
    }

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
}