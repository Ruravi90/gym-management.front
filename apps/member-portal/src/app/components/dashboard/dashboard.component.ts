import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, AttendanceService } from '@shared';
import { KaizenService } from '../kaizen/kaizen.service';
import { GamificationService } from '../progress/progress.service';
import { GamificationDashboard, XpLog, WeeklyChallenge } from '@shared/models/gamification.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-container">
      <div *ngIf="toastMessage" class="toast" [class.toast-success]="toastType === 'success'" [class.toast-error]="toastType === 'error'">
        {{ toastMessage }}
      </div>

      <header class="welcome-bar">
        <div>
          <h1>Hola, {{ clientName }} 👋</h1>
          <p class="muted">{{ greeting }}</p>
        </div>
      </header>

      <app-level-bar></app-level-bar>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon checkin-icon">📅</div>
          <div class="stat-body">
            <span class="stat-value">{{ checkinsThisMonth }}</span>
            <span class="stat-label">Check-ins este mes</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon streak-icon">🔥</div>
          <div class="stat-body">
            <span class="stat-value">{{ currentStreak }}</span>
            <span class="stat-label">Racha actual (días)</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon xp-icon">⚡</div>
          <div class="stat-body">
            <span class="stat-value">+{{ xpToday }}</span>
            <span class="stat-label">XP ganados hoy</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon kaizen-icon">🌿</div>
          <div class="stat-body">
            <span class="stat-value">{{ kaizenVictoriesToday }}</span>
            <span class="stat-label">Victoria(s) Kaizen hoy</span>
          </div>
        </div>
      </div>

      <!-- Active Challenge -->
      <div class="challenge-banner" *ngIf="activeChallenge">
        <div class="challenge-info">
          <span class="challenge-badge">🏆 Reto de la semana</span>
          <h3>{{ activeChallenge.title }}</h3>
          <p class="muted">{{ activeChallenge.description }}</p>
        </div>
        <div class="challenge-progress">
          <div class="progress-ring">
            <span class="progress-pct">{{ activeChallenge.progress_percent }}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" [style.width.%]="activeChallenge.progress_percent"></div>
          </div>
          <span class="progress-text">{{ activeChallenge.current_progress }} / {{ activeChallenge.criteria_value }}</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Accesos rápidos</h3>
        <div class="actions-row">
          <button routerLink="/my-qr" class="action-btn">
            <span class="action-icon">📱</span>
            <span class="action-label">Check-in QR</span>
          </button>
          <button routerLink="/mejora-continua" class="action-btn">
            <span class="action-icon">✅</span>
            <span class="action-label">Registrar hábito</span>
          </button>
          <button routerLink="/rutinas" class="action-btn">
            <span class="action-icon">🏋️</span>
            <span class="action-label">Entrenar</span>
          </button>
          <button routerLink="/mi-progreso" class="action-btn">
            <span class="action-icon">📊</span>
            <span class="action-label">Mi Progreso</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-card" *ngIf="recentActivity.length > 0">
        <h3>Actividad reciente</h3>
        <ul class="activity-list">
          <li *ngFor="let item of recentActivity" class="activity-item">
            <span class="activity-icon">{{ getActionIcon(item.action_type) }}</span>
            <div class="activity-body">
              <span class="activity-desc">{{ item.description }}</span>
              <span class="activity-time">{{ item.created_at | date:'short' }}</span>
            </div>
            <span class="activity-xp">+{{ item.xp_amount }} XP</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .welcome-bar {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
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

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    @media (min-width: 768px) {
      .stats-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .stat-card {
      background: white;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .checkin-icon { background: #dbeafe; }
    .streak-icon { background: #fef3c7; }
    .xp-icon { background: #dcfce7; }
    .kaizen-icon { background: #f0fdf4; }
    .stat-body { display: flex; flex-direction: column; min-width: 0; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-main); line-height: 1.2; }
    .stat-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Challenge Banner */
    .challenge-banner {
      background: linear-gradient(135deg, var(--lime-50) 0%, white 100%);
      border: 1px solid var(--app-primary-soft-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .challenge-banner { flex-direction: row; align-items: center; justify-content: space-between; }
    }
    .challenge-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--lime-700);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .challenge-info h3 { margin: 0.35rem 0 0.25rem; font-size: 1.1rem; }
    .challenge-info p { margin: 0; font-size: 0.88rem; }
    .challenge-progress { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; min-width: 140px; }
    .progress-ring {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: var(--app-primary);
      color: #1a2e05;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.9rem;
    }
    .progress-bar-container {
      width: 100%; height: 6px;
      background: var(--slate-200, #e2e8f0);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--app-primary);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    .progress-text { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; }

    /* Quick Actions */
    .quick-actions { margin-bottom: 1.5rem; }
    .quick-actions h3 { margin: 0 0 1rem; font-size: 1rem; color: var(--text-main); }
    .actions-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    @media (min-width: 768px) {
      .actions-row { grid-template-columns: repeat(4, 1fr); }
    }
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem 1rem;
      background: white;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
      color: var(--text-main);
    }
    .action-btn:hover {
      border-color: var(--app-primary);
      background: var(--app-primary-soft);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .action-icon { font-size: 1.5rem; }
    .action-label { font-size: 0.82rem; font-weight: 600; text-align: center; }

    /* Activity Feed */
    .activity-card {
      background: white;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    .activity-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .activity-list { list-style: none; margin: 0; padding: 0; }
    .activity-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--app-border);
    }
    .activity-item:last-child { border-bottom: none; }
    .activity-icon { font-size: 1.2rem; flex-shrink: 0; }
    .activity-body { flex: 1; min-width: 0; }
    .activity-desc { display: block; font-size: 0.88rem; font-weight: 500; color: var(--text-main); }
    .activity-time { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
    .activity-xp {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--lime-700);
      white-space: nowrap;
    }

    /* Toast */
    .toast {
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1rem;
      font-weight: 600;
      animation: slideDown 0.3s ease-out;
    }
    .toast-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .toast-error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  clientName = 'Socio';
  greeting = 'Este es tu espacio de entrenamiento. ¡Sigue así!';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  checkinsThisMonth = 0;
  currentStreak = 0;
  xpToday = 0;
  kaizenVictoriesToday = 0;
  activeChallenge: WeeklyChallenge | null = null;
  recentActivity: XpLog[] = [];

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private kaizenService: KaizenService,
    private gamificationService: GamificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.clientName = user.name;
    }
    this.setGreeting();
    this.handleCheckinQueryParams();
    this.loadDashboard();
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = '¡Buenos días! ¿Listo para entrenar hoy?';
    else if (hour < 18) this.greeting = '¡Buenas tardes! Aprovecha el día para entrenar.';
    else this.greeting = '¡Buenas noches! Revisa tu progreso del día.';
  }

  private handleCheckinQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['checkin']) {
        this.toastType = params['checkin'] === 'success' ? 'success' : 'error';
        this.toastMessage = params['checkin'] === 'success'
          ? (params['msg'] || '¡Check-in exitoso!')
          : (params['msg'] || 'Error en el check-in');
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
        setTimeout(() => { this.toastMessage = ''; }, 5000);
      }
    });
  }

  private loadDashboard() {
    // Load gamification dashboard (level, streak, XP, challenges, recent activity)
    this.gamificationService.getDashboard().subscribe({
      next: (data) => {
        this.currentStreak = data.progress.current_streak;
        this.activeChallenge = data.active_challenges?.[0] || null;
        this.recentActivity = data.recent_xp || [];

        // Calculate XP earned today from recent_xp
        const today = new Date().toDateString();
        this.xpToday = data.recent_xp
          ?.filter(x => new Date(x.created_at).toDateString() === today)
          .reduce((sum, x) => sum + x.xp_amount, 0) || 0;
      },
      error: () => {}
    });

    // Load attendance for checkins this month
    const user = this.authService.getCurrentUser();
    if (user) {
      this.attendanceService.getAttendanceHistory(user.id).subscribe({
        next: (history) => {
          const now = new Date();
          this.checkinsThisMonth = (history || []).filter((a: any) => {
            const d = new Date(a.timestamp);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length;
        },
        error: () => {}
      });
    }

    // Load Kaizen habits for today's victories
    const now = new Date();
    this.kaizenService.getHabits(now.getMonth() + 1, now.getFullYear()).subscribe({
      next: (habits) => {
        const todayStr = now.toISOString().split('T')[0];
        this.kaizenVictoriesToday = habits.reduce((count, h) => {
          return count + (h.logs?.filter(l => l.date === todayStr && l.status === 'victory').length || 0);
        }, 0);
      },
      error: () => {}
    });
  }

  getActionIcon(actionType: string): string {
    const icons: Record<string, string> = {
      'checkin': '📅',
      'kaizen_victory': '🌿',
      'workout_completed': '🏋️',
      'set_logged': '💪',
      'measurement': '📏',
      'streak_7': '🔥',
      'streak_30': '💎',
      'achievement_unlocked': '🏆',
      'challenge_completed': '🎯'
    };
    return icons[actionType] || '⚡';
  }
}
