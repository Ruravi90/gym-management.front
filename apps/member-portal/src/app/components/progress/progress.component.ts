import { Component, OnInit } from '@angular/core';
import { GamificationService } from './progress.service';
import {
  GamificationDashboard,
  Achievement,
  WeeklyChallenge
} from '@shared/models/gamification.model';

@Component({
  selector: 'app-progress',
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Mi Progreso 📊</h1>
        <p class="muted">Tu camino hacia la excelencia: XP, niveles, rachas, logros y retos semanales.</p>
      </header>

      <div class="grid grid-2" *ngIf="dashboard">
        <!-- Nivel y XP -->
        <div class="card level-card">
          <div class="level-hero">
            <div class="level-circle">
              <span class="level-num">{{ dashboard.progress.level }}</span>
              <span class="level-txt">NIVEL</span>
            </div>
            <div class="level-details">
              <h2>Nivel {{ dashboard.progress.level }}</h2>
              <p class="xp-big">{{ dashboard.progress.xp | number }} XP totales</p>
            </div>
          </div>
          <div class="xp-bar-section">
            <div class="xp-bar-track">
              <div class="xp-bar-progress" [style.width.%]="dashboard.progress.xp_progress_percent"></div>
            </div>
            <div class="xp-bar-labels">
              <span>{{ dashboard.progress.xp | number }} XP</span>
              <span>{{ dashboard.progress.xp_for_next_level | number }} XP (nivel {{ dashboard.progress.level + 1 }})</span>
            </div>
          </div>
        </div>

        <!-- Racha -->
        <div class="card streak-card">
          <h3>Racha de Asistencia</h3>
          <div class="streak-hero">
            <div class="streak-big">
              <span class="streak-fire">🔥</span>
              <span class="streak-num">{{ dashboard.progress.current_streak }}</span>
              <span class="streak-unit">días</span>
            </div>
            <p class="streak-label">Racha actual</p>
          </div>
          <div class="streak-stats">
            <div class="streak-stat">
              <span class="stat-value">{{ dashboard.progress.longest_streak }}</span>
              <span class="stat-label">Récord</span>
            </div>
            <div class="streak-stat">
              <span class="stat-value">{{ dashboard.unlocked_achievements }}/{{ dashboard.total_achievements }}</span>
              <span class="stat-label">Logros</span>
            </div>
          </div>
        </div>

        <!-- Últimas acciones XP -->
        <div class="card xp-history-card">
          <h3>Últimas Acciones</h3>
          <div class="xp-list" *ngIf="dashboard.recent_xp.length > 0">
            <div class="xp-item" *ngFor="let log of dashboard.recent_xp">
              <div class="xp-item-icon" [ngClass]="getActionClass(log.action_type)">
                {{ getActionIcon(log.action_type) }}
              </div>
              <div class="xp-item-info">
                <span class="xp-item-desc">{{ log.description }}</span>
                <span class="xp-item-date">{{ log.created_at | date:'dd MMM HH:mm' }}</span>
              </div>
              <span class="xp-item-amount">+{{ log.xp_amount }} XP</span>
            </div>
          </div>
          <div class="empty-state" *ngIf="dashboard.recent_xp.length === 0">
            <p>Aún no tienes acciones registradas.</p>
          </div>
        </div>

        <!-- Logros Recientes -->
        <div class="card achievements-card">
          <h3>Logros Recientes</h3>
          <div class="achievements-list" *ngIf="dashboard.recent_achievements.length > 0">
            <div class="achievement-item earned" *ngFor="let a of dashboard.recent_achievements">
              <span class="achievement-icon">{{ a.icon }}</span>
              <div class="achievement-info">
                <span class="achievement-name">{{ a.name }}</span>
                <span class="achievement-date">{{ a.earned_date | date:'dd MMM yyyy' }}</span>
              </div>
              <span class="achievement-xp">+{{ a.xp_reward }} XP</span>
            </div>
          </div>
          <div class="empty-state" *ngIf="dashboard.recent_achievements.length === 0">
            <p>¡Realiza acciones para desbloquear logros!</p>
          </div>
        </div>
      </div>

      <!-- Todos los Logros -->
      <div class="card all-achievements-card" *ngIf="achievements.length > 0">
        <h2>Todos los Logros ({{ unlockedCount }}/{{ achievements.length }})</h2>
        <div class="achievements-grid">
          <div class="achievement-tile" *ngFor="let a of achievements"
               [ngClass]="a.earned ? 'earned' : 'locked'">
            <span class="tile-icon">{{ a.icon }}</span>
            <span class="tile-name">{{ a.name }}</span>
            <span class="tile-desc">{{ a.description }}</span>
            <div class="tile-progress" *ngIf="!a.earned">
              <div class="tile-progress-track">
                <div class="tile-progress-fill"
                     [style.width.%]="(a.progress / a.target) * 100"></div>
              </div>
              <span class="tile-progress-text">{{ a.progress }}/{{ a.target }}</span>
            </div>
            <span class="tile-earned" *ngIf="a.earned">✅ Desbloqueado</span>
          </div>
        </div>
      </div>

      <!-- Retos Semanales -->
      <div class="card challenges-card" *ngIf="challenges.length > 0">
        <h2>Retos de la Semana 🎯</h2>
        <div class="challenges-list">
          <div class="challenge-item" *ngFor="let ch of challenges"
               [ngClass]="ch.completed ? 'completed' : ''">
            <div class="challenge-header">
              <div class="challenge-info">
                <h4>{{ ch.title }}</h4>
                <p>{{ ch.description }}</p>
              </div>
              <span class="challenge-xp" *ngIf="!ch.completed">+{{ ch.xp_reward }} XP</span>
              <span class="challenge-done" *ngIf="ch.completed">✅ Completado</span>
            </div>
            <div class="challenge-progress-bar">
              <div class="challenge-progress-fill"
                   [style.width.%]="ch.progress_percent"
                   [ngClass]="ch.completed ? 'completed' : ''"></div>
            </div>
            <div class="challenge-progress-text">
              <span>{{ ch.current_progress }}/{{ ch.criteria_value }}</span>
              <span>{{ ch.progress_percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.75rem; }
    .page-header h1 { margin: 0 0 0.25rem; font-size: 1.9rem; font-weight: 800; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
    @media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }

    .card { background: var(--app-surface); border: 1px solid var(--app-border); border-radius: var(--radius-xl); padding: 1.5rem; }
    .card h2 { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800; }
    .card h3 { margin: 0 0 1rem; font-size: 1.1rem; font-weight: 700; }

    /* Level Card */
    .level-hero { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.25rem; }
    .level-circle {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-dark) 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .level-num { color: white; font-size: 1.8rem; font-weight: 800; line-height: 1; }
    .level-txt { color: rgba(255,255,255,0.8); font-size: 0.5rem; font-weight: 700; letter-spacing: 1.5px; }
    .level-details h2 { margin: 0 0 0.25rem; font-size: 1.3rem; }
    .xp-big { margin: 0; color: var(--app-primary); font-weight: 700; font-size: 1rem; }

    .xp-bar-track { height: 10px; background: var(--slate-100); border-radius: 5px; overflow: hidden; }
    .xp-bar-progress { height: 100%; background: linear-gradient(90deg, var(--app-primary) 0%, var(--app-primary-light) 100%); border-radius: 5px; transition: width 1s ease; }
    .xp-bar-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem; }

    /* Streak Card */
    .streak-hero { text-align: center; margin-bottom: 1.25rem; }
    .streak-big { display: flex; align-items: baseline; justify-content: center; gap: 0.4rem; }
    .streak-fire { font-size: 2rem; }
    .streak-num { font-size: 3rem; font-weight: 800; color: var(--text-main); line-height: 1; }
    .streak-unit { font-size: 1.1rem; color: var(--text-muted); font-weight: 600; }
    .streak-label { margin: 0.5rem 0 0; color: var(--text-muted); font-size: 0.9rem; }

    .streak-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px solid var(--app-border); padding-top: 1rem; }
    .streak-stat { text-align: center; }
    .stat-value { display: block; font-size: 1.3rem; font-weight: 800; color: var(--text-main); }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); }

    /* XP History */
    .xp-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .xp-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid var(--app-border); }
    .xp-item:last-child { border-bottom: none; }
    .xp-item-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    .xp-item-icon.check_in { background: #dbeafe; }
    .xp-item-icon.kaizen_victory { background: #dcfce7; }
    .xp-item-icon.workout_completed { background: #fef3c7; }
    .xp-item-icon.set_logged { background: #f3e8ff; }
    .xp-item-icon.measurement_logged { background: #fce7f3; }
    .xp-item-icon.streak_bonus { background: #fed7aa; }
    .xp-item-icon.achievement_unlocked { background: #fef9c3; }
    .xp-item-info { flex: 1; min-width: 0; }
    .xp-item-desc { display: block; font-size: 0.88rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .xp-item-date { font-size: 0.75rem; color: var(--text-muted); }
    .xp-item-amount { font-weight: 800; color: var(--app-primary); font-size: 0.9rem; flex-shrink: 0; }

    /* Achievements */
    .achievements-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .achievement-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid var(--app-border); }
    .achievement-item:last-child { border-bottom: none; }
    .achievement-icon { font-size: 1.5rem; flex-shrink: 0; }
    .achievement-info { flex: 1; }
    .achievement-name { display: block; font-weight: 700; font-size: 0.9rem; }
    .achievement-date { font-size: 0.75rem; color: var(--text-muted); }
    .achievement-xp { font-weight: 800; color: var(--app-primary); font-size: 0.85rem; }

    .empty-state { text-align: center; padding: 1.5rem 0; color: var(--text-muted); }

    /* All achievements grid */
    .all-achievements-card { margin-top: 1.25rem; }
    .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
    .achievement-tile {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      padding: 1.25rem 1rem; border-radius: var(--radius-lg);
      border: 1px solid var(--app-border); background: var(--slate-50);
      transition: all 0.2s ease;
    }
    .achievement-tile.earned { background: var(--app-surface); border-color: var(--app-primary-soft-border); }
    .achievement-tile.locked { opacity: 0.5; filter: grayscale(60%); }
    .tile-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .tile-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.25rem; }
    .tile-desc { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .tile-progress { width: 100%; }
    .tile-progress-track { height: 6px; background: var(--slate-200); border-radius: 3px; overflow: hidden; }
    .tile-progress-fill { height: 100%; background: var(--app-primary); border-radius: 3px; }
    .tile-progress-text { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; display: block; }
    .tile-earned { font-size: 0.75rem; color: var(--success); font-weight: 600; }

    /* Challenges */
    .challenges-card { margin-top: 1.25rem; }
    .challenges-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .challenge-item {
      padding: 1rem; border-radius: var(--radius-lg);
      border: 1px solid var(--app-border); background: var(--slate-50);
      transition: all 0.2s ease;
    }
    .challenge-item.completed { background: #f0fdf4; border-color: #86efac; }
    .challenge-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.75rem; }
    .challenge-info { flex: 1; }
    .challenge-info h4 { margin: 0 0 0.2rem; font-size: 0.95rem; font-weight: 700; }
    .challenge-info p { margin: 0; font-size: 0.8rem; color: var(--text-muted); }
    .challenge-xp {
      background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-dark) 100%);
      color: white; padding: 0.3rem 0.6rem; border-radius: var(--radius-md);
      font-size: 0.75rem; font-weight: 700; white-space: nowrap;
    }
    .challenge-done { color: var(--success); font-weight: 700; font-size: 0.85rem; white-space: nowrap; }
    .challenge-progress-bar { height: 8px; background: var(--slate-200); border-radius: 4px; overflow: hidden; }
    .challenge-progress-fill { height: 100%; background: var(--app-primary); border-radius: 4px; transition: width 0.8s ease; }
    .challenge-progress-fill.completed { background: var(--success); }
    .challenge-progress-text { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem; }
  `]
})
export class ProgressComponent implements OnInit {
  dashboard: GamificationDashboard | null = null;
  achievements: Achievement[] = [];
  challenges: WeeklyChallenge[] = [];
  unlockedCount = 0;

  constructor(private gamificationService: GamificationService) {}

  ngOnInit() {
    this.gamificationService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        if (data.active_challenges) {
          this.challenges = data.active_challenges;
        }
      },
      error: () => {}
    });
    this.gamificationService.getAchievements().subscribe({
      next: (data) => {
        this.achievements = data;
        this.unlockedCount = data.filter(a => a.earned).length;
      },
      error: () => {}
    });
  }

  getActionIcon(type: string): string {
    const icons: Record<string, string> = {
      check_in: '🏋️',
      kaizen_victory: '🎯',
      workout_completed: '💪',
      set_logged: '🔄',
      measurement_logged: '📏',
      streak_bonus: '🔥',
      achievement_unlocked: '🏆'
    };
    return icons[type] || '⭐';
  }

  getActionClass(type: string): string {
    return type;
  }
}
