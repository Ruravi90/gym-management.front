import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:8000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
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
      map(response => {
        // Store token in local storage
        localStorage.setItem('accessToken', response.access_token);
        return response;
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Method to get user info after login
  fetchCurrentUser(): Observable<User> {
    const token = this.getAccessToken();
    if (!token) {
      return of(null as any);
    }

    // In a real app, we'd have an endpoint like /users/me
    // For now, we'll just return the stored user, but ideally we'd fetch from API
    // This would require a new endpoint in the backend
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return of(JSON.parse(storedUser));
    }

    // If no stored user, we'd need to fetch from API
    // This would require a new endpoint in the backend
    return of(null as any);
  }

  // Method to fetch user info from API
  fetchUserInfo(): Observable<User> {
    const token = this.getAccessToken();
    if (!token) {
      return of(null as any);
    }

    // This would require a new endpoint in the backend like /users/me
    // For now, return the stored user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return of(JSON.parse(storedUser));
    }

    return of(null as any);
  }
}