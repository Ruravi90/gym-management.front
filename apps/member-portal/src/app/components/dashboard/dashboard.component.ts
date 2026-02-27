import { Component, OnInit } from '@angular/core';
import { AuthService, ClientService, AttendanceService } from '@shared';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <header>
        <h1>Hola, {{ clientName }}</h1>
        <button (click)="logout()">Cerrar Sesión</button>
      </header>
      
      <main>
        <div class="card membership-card">
          <h3>Mi Membresía</h3>
          <p class="status active">Activa</p>
          <p>Próximo vencimiento: 15 de Marzo</p>
          <button routerLink="/memberships/purchase" class="btn-purchase">Renovar o Cambiar Plan</button>
        </div>

        <div class="card attendance-card">
          <h3>Mis últimas asistencias</h3>
          <ul>
            <li *ngFor="let entry of attendanceList">
              {{ entry.timestamp | date:'short' }}
            </li>
          </ul>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 1rem; max-width: 600px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .card { background: white; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
    .status.active { color: #10b981; font-weight: bold; }
    button { padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
  `]
})
export class DashboardComponent implements OnInit {
  clientName = 'Socio';
  attendanceList: any[] = [];

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.clientName = user.name;
      // In a real scenario, we'd fetch the client profile first
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
