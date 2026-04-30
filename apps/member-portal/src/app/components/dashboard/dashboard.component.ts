import { Component, OnInit } from '@angular/core';
import { AuthService, ClientService, AttendanceService } from '@shared';
import { KaizenService } from '../kaizen/kaizen.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container" style="background-color: #111; min-height: 100vh;">
      <header>
        <h1>Hola, {{ clientName }}</h1>
        <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
      </header>
      
      <main>
        <div class="card membership-card">
          <h3>Mi Membresía</h3>
          <p class="status active">Activa</p>
          <p>Próximo vencimiento: 15 de Marzo</p>
          <button routerLink="/memberships/purchase" class="btn-purchase">Renovar o Cambiar Plan</button>
        </div>

        <div class="card kaizen-card">
          <h3 style="color: #f9d423; border-bottom: none; padding-bottom: 0;">Mejora Continua</h3>
          <p style="color: #aaa;">Convierte tus metas en hábitos y obtén medallas.</p>

          <div *ngIf="kaizenChartData.length > 0" style="height: 200px; margin: 15px 0;">
            <ngx-charts-pie-chart
              [results]="kaizenChartData"
              [scheme]="colorScheme"
              [doughnut]="true"
              [legend]="true"
              [labels]="false">
            </ngx-charts-pie-chart>
          </div>
          <div *ngIf="kaizenChartData.length === 0" style="padding: 20px; text-align: center; opacity: 0.7;">
            No tienes registros este mes.
          </div>

          <div *ngIf="forgottenHabitsData.length > 0" style="margin-top: 15px; border-top: 1px solid #444; padding-top: 15px;">
            <h4 style="color: #f87171; margin-top: 0; margin-bottom: 10px;">⚠️ Hábitos Olvidados (% Éxito)</h4>
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

          <button routerLink="/mejora-continua" class="btn-purchase" style="margin-top: 10px;">Ver Mis Hábitos y Logros</button>
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
    .dashboard-container { 
      padding: 1rem; 
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #eee;
    }
    @media (min-width: 768px) {
      .dashboard-container {
        padding: 2rem;
      }
    }
    header { 
      display: flex; 
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between; 
      align-items: flex-start; 
      margin-bottom: 1.5rem; 
      background: rgba(18, 18, 18, 0.7);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 15px 35px rgba(0,0,0,0.5);
      padding: 1.5rem;
      border-radius: 24px;
    }
    @media (min-width: 768px) {
      header {
        flex-direction: row;
        align-items: center;
        padding: 2.5rem;
        border-radius: 32px;
      }
    }
    header h1 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.1;
    }
    @media (min-width: 768px) {
      header h1 {
        font-size: 3rem;
      }
    }
    main {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 1024px) {
      main {
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
      }
    }
    .card { 
      background: rgba(18, 18, 18, 0.7); 
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      padding: 1.5rem; 
      border-radius: 32px; 
      box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
      border: 1px solid rgba(255,255,255,0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @media (min-width: 768px) {
      .card {
        padding: 2.5rem;
      }
    }
    .card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .card h3 {
      color: #fff;
      font-weight: 800;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 1rem;
      margin-top: 0;
      font-size: 1.5rem;
      letter-spacing: -0.5px;
    }
    .status.active { 
      color: #4ade80; 
      font-weight: 800; 
      background: rgba(74, 222, 128, 0.05);
      border: 1px solid rgba(74, 222, 128, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 10px;
      display: inline-block;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn-purchase, .btn-logout { 
      padding: 0.9rem 1.8rem; 
      border-radius: 18px; 
      border: none; 
      font-weight: 800;
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-purchase {
      background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%);
      color: black;
      width: 100%;
      margin-top: 1.5rem;
      box-shadow: 0 8px 20px rgba(249, 212, 35, 0.25);
      font-size: 1rem;
    }
    .btn-purchase:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 28px rgba(249, 212, 35, 0.4);
    }
    .btn-logout {
      background: rgba(255,255,255,0.05);
      color: white;
      border: 1px solid rgba(255,255,255,0.1);
      font-size: 0.9rem;
    }
    .btn-logout:hover {
      background: rgba(255,255,255,0.15);
      transform: translateY(-2px);
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    ul li {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #aaa;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    ul li::before {
      content: '📅';
      font-size: 1.1rem;
    }
    ul li:last-child {
      border-bottom: none;
    }

    /* Fix for ngx-charts visibility in dark mode */
    ::ng-deep .ngx-charts text {
      fill: #fff !important;
    }
    ::ng-deep .ngx-charts .legend-title-text {
      color: #fff !important;
    }
    ::ng-deep .ngx-charts .legend-label-text {
      color: #aaa !important;
    }
    ::ng-deep .ngx-charts .legend-label-text:hover {
      color: #fff !important;
    }
    ::ng-deep .ngx-charts .tick text {
      fill: #bbb !important;
    }
  `]
})
export class DashboardComponent implements OnInit {
  clientName = 'Socio';
  attendanceList: any[] = [];
  
  kaizenChartData: any[] = [];
  colorScheme: any = {
    domain: ['#4ade80', '#f87171']
  };

  forgottenHabitsData: any[] = [];
  forgottenColorScheme: any = {
    domain: ['#f87171', '#fb923c', '#facc15']
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
