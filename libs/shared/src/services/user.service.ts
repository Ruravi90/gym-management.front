import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

import { User } from '../models/user.model';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { withCredentials: true });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, { withCredentials: true });
  }

  updateUser(id: number, user: Partial<CreateUserRequest>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { withCredentials: true });
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  changeUserRole(id: number, role: string) {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role }, { withCredentials: true });
  }

  changeUserStatus(id: number, status: boolean) {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, { status }, { withCredentials: true });
  }
}
