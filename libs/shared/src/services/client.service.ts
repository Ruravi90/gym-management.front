import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

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

  constructor(private http: HttpClient) { }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, { withCredentials: true });
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createClient(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client, { withCredentials: true });
  }

  updateClient(id: number, client: Partial<CreateClientRequest>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client, { withCredentials: true });
  }

  deleteClient(id: number): Observable<Client> {
    return this.http.delete<Client>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  searchClients(searchTerm: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/search/?search=${encodeURIComponent(searchTerm)}`, { withCredentials: true });
  }

  registerFace(clientId: number, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', image);
    return this.http.post(`${this.apiUrl}/${clientId}/face`, formData, { withCredentials: true });
  }

  getFaceRegistrationStatus(clientId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clientId}/face`, { withCredentials: true });
  }

  removeFaceRegistration(clientId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${clientId}/face`, { withCredentials: true });
  }
}
