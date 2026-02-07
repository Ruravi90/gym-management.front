import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  membership_type: string;
  status: boolean;
  profile_image?: string;
  created_at: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  membership_type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): {
    'Authorization': string;
    'Content-Type': string;
  } {
    const token = this.authService.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createClient(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client, { headers: this.getAuthHeaders() });
  }

  updateClient(id: number, client: Partial<CreateClientRequest>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client, { headers: this.getAuthHeaders() });
  }

  deleteClient(id: number): Observable<Client> {
    return this.http.delete<Client>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  searchClients(searchTerm: string): Observable<Client[]> {
    const url = `${this.apiUrl}/search/?search=${encodeURIComponent(searchTerm)}`;
    return this.http.get<Client[]>(url, { headers: this.getAuthHeaders() });
  }

  registerFace(clientId: number, image: File): Observable<any> {
    const token = this.authService.getAccessToken();
    const formData = new FormData();
    formData.append('file', image);
    return this.http.post(`${this.apiUrl}/${clientId}/face`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getFaceRegistrationStatus(clientId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clientId}/face`, { headers: this.getAuthHeaders() });
  }

  removeFaceRegistration(clientId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${clientId}/face`, { headers: this.getAuthHeaders() });
  }
}