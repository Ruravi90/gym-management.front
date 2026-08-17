import { Component, OnInit } from '@angular/core';
import { AuthService, ClientService, AttendanceService } from '@shared';
import { KaizenService } from '../kaizen/kaizen.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-container">
      <header class="welcome-bar">
        <div>
          <h1>Hola, {{ clientName }} 👋</h1>
          <p class="muted">Este es tu espacio de entrenamiento. ¡Sigue así!</p>
        </div>
        <button class="btn btn-outline" (click)="logout()">Cerrar Sesión</button>
      </header>

      <div class="grid grid-2">
        <div class="card">
          <div class="card-head">
            <h3>Mi Membresía</h3>
            <span class="badge badge-success">Activa</span>
          </div>
          <p class="muted">Próximo vencimiento: 15 de Marzo</p>
          <button routerLink="/memberships/purchase" class="btn btn-primary btn-block mt-2">Renovar o Cambiar Plan</button>
        </div>

        <div class="card">
          <div class="card-head">
            <h3>Mejora Continua</h3>
            <span class="badge badge-primary">Kaizen</span>
          </div>
          <p class="muted">Convierte tus metas en hábitos y obtén medallas.</p>

          <div *ngIf="kaizenChartData.length > 0" style="height: 200px; margin: 15px 0;">
            <ngx-charts-pie-chart
              [results]="kaizenChartData"
              [scheme]="colorScheme"
              [doughnut]="true"
              [legend]="true"
              [labels]="false">
            </ngx-charts-pie-chart>
          </div>
          <div *ngIf="kaizenChartData.length === 0" class="muted text-center" style="padding: 20px 0;">
            No tienes registros este mes.
          </div>

          <div *ngIf="forgottenHabitsData.length > 0" class="forgotten">
            <h4>Hábitos por mejorar (% Éxito)</h4>
            <div style="height: 120px;">
              <ngx-charts-bar-horizontal
                [results]="forgottenHabitsData"
                [scheme]="forgottenColorScheme"
                [xAxis]="false"
                [yAxis]="true"
                [showDataLabel]="true">
              </ngx-charts-bar-horizontal>
            </div>
          </div>

          <button routerLink="/mejora-continua" class="btn btn-outline btn-block mt-2">Ver Mis Hábitos y Logros</button>
        </div>

        <div class="card">
          <div class="card-head">
            <h3>Mis Rutinas 🏋️</h3>
            <span class="badge badge-primary">Entrenamiento</span>
          </div>
          <p class="muted">Sigue tus días de entrenamiento, registra tus series y consulta a tu mentor con IA.</p>
          <div class="stack">
            <button routerLink="/rutinas" class="btn btn-primary btn-block">Ver Mis Rutinas</button>
            <button routerLink="/rutinas/mentor" class="btn btn-outline btn-block">🤖 Hablar con FitMentor</button>
            <button routerLink="/rutinas/medidas" class="btn btn-outline btn-block">📏 Registrar Mis Medidas</button>
          </div>
        </div>

        <div class="card">
          <h3>Mis últimas asistencias</h3>
          <ul class="attendance-list">
            <li *ngFor="let entry of attendanceList">
              <span class="chip chip-primary">📅</span>
              {{ entry.timestamp | date:'short' }}
            </li>
            <li *ngIf="attendanceList.length === 0" class="muted">Aún no tienes asistencias registradas.</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-bar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.75rem;
      background: linear-gradient(120deg, var(--lime-50) 0%, var(--app-surface) 60%);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      padding: 1.75rem;
    }
    @media (min-width: 768px) {
      .welcome-bar { flex-direction: row; align-items: center; padding: 2rem 2.25rem; }
    }
    .welcome-bar h1 {
      margin: 0 0 0.25rem;
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    @media (min-width: 768px) { .welcome-bar h1 { font-size: 2.25rem; } }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--app-border);
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    .card h3 { margin: 0; font-size: 1.2rem; }
    .stack { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; }

    .attendance-list { list-style: none; margin: 0; padding: 0; }
    .attendance-list li {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.7rem 0;
      border-bottom: 1px solid var(--app-border);
      font-size: 0.92rem;
    }
    .attendance-list li:last-child { border-bottom: none; }

    .forgotten {
      margin-top: 0.75rem;
      border-top: 1px solid var(--app-border);
      padding-top: 0.75rem;
    }
    .forgotten h4 { margin: 0 0 0.5rem; font-size: 0.9rem; color: var(--danger); }

    /* Fix para ngx-charts en tema claro */
    ::ng-deep .ngx-charts text { fill: var(--slate-600) !important; }
    ::ng-deep .ngx-charts .legend-title-text { color: var(--text-main) !important; }
    ::ng-deep .ngx-charts .legend-label-text { color: var(--text-muted) !important; }
  `]
})
export class DashboardComponent implements OnInit {
  clientName = 'Socio';
  attendanceList: any[] = [];

  kaizenChartData: any[] = [];
  colorScheme: any = {
    domain: ['#16a34a', '#ef4444']
  };

  forgottenHabitsData: any[] = [];
  forgottenColorScheme: any = {
    domain: ['#ef4444', '#f97316', '#eab308']
  };

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private attendanceService: AttendanceService,
    private kaizenService: KaizenService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.clientName = user.name;
      // In a real scenario, we'd fetch the client profile first
    }
    this.loadKaizenStats();
  }

  loadKaizenStats() {
    const now = new Date();
    this.kaizenService.getHabits(now.getMonth() + 1, now.getFullYear()).subscribe(habits => {
      let vics = 0;
      let ders = 0;
      let forgotten: any[] = [];

      habits.forEach(h => {
        let hVics = 0;
        let hTotal = 0;
        if (h.logs) {
          hVics = h.logs.filter(l => l.status === 'victory').length;
          let hDers = h.logs.filter(l => l.status === 'defeat').length;
          vics += hVics;
          ders += hDers;
          hTotal = hVics + hDers;
        }

        let rate = hTotal > 0 ? (hVics / hTotal) * 100 : 0;
        if (hTotal > 0 || rate === 0) {
          forgotten.push({ name: h.name, value: Math.round(rate) });
        }
      });

      if (vics > 0 || ders > 0) {
        this.kaizenChartData = [
          { name: 'Victorias', value: vics },
          { name: 'Derrotas', value: ders }
        ];
      }

      // Sort lowest success rate first
      forgotten.sort((a, b) => a.value - b.value);
      this.forgottenHabitsData = forgotten.slice(0, 3);
    });
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
