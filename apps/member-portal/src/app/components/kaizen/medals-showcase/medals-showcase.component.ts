import { Component, Input } from '@angular/core';
import { KaizenMedal } from '../kaizen.service';

@Component({
  selector: 'app-medals-showcase',
  template: `
    <div class="card medals-card">
      <h2>Logros y Medallas</h2>

      <div class="medals-grid">
        <div class="medal-item" *ngFor="let m of allMedalTypes" [ngClass]="[m.type, isEarned(m.type) ? 'earned' : 'locked']">
          <div class="medal-icon">
            <span *ngIf="m.type === 'daily'">🥉</span>
            <span *ngIf="m.type === 'weekly'">🥈</span>
            <span *ngIf="m.type === 'monthly'">🥇</span>
            <span *ngIf="m.type === 'yearly'">👑</span>
          </div>
          <div class="medal-info">
            <h4>{{ m.type | uppercase }}</h4>
            <p>{{ m.name }}</p>
            <small *ngIf="isEarned(m.type)">Desbloqueada</small>
            <small *ngIf="!isEarned(m.type)">Bloqueada 🔒</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medals-card { height: fit-content; }
    .medals-card h2 {
      margin-top: 0;
      font-weight: 800;
      border-bottom: 1px solid var(--app-border);
      padding-bottom: 1rem;
      margin-bottom: 1.25rem;
      font-size: 1.35rem;
    }
    .medals-grid { display: grid; grid-template-columns: 1fr; gap: 0.9rem; }
    .medal-item {
      display: flex;
      align-items: center;
      background: var(--slate-50);
      border-radius: var(--radius-lg);
      padding: 1.1rem;
      position: relative;
      overflow: hidden;
      border: 1px solid var(--app-border);
      transition: all 0.2s ease;
    }
    .medal-item:hover { transform: scale(1.02); box-shadow: var(--shadow-sm); }

    .medal-item.earned { background: var(--app-surface); border-color: var(--app-primary-soft-border); }

    .medal-item.daily.earned { border-left: 4px solid #cd7f32; }
    .medal-item.weekly.earned { border-left: 4px solid #94a3b8; }
    .medal-item.monthly.earned { border-left: 4px solid #eab308; }
    .medal-item.yearly.earned {
      border-left: 4px solid #38bdf8;
      background: linear-gradient(135deg, var(--app-surface) 0%, var(--info-bg) 100%);
    }

    .medal-item.locked { opacity: 0.45; filter: grayscale(100%); }

    .medal-icon { font-size: 2rem; margin-right: 1.1rem; flex-shrink: 0; }
    .medal-info h4 {
      margin: 0 0 0.2rem 0;
      font-size: 0.7rem;
      color: var(--text-muted);
      letter-spacing: 1.5px;
      font-weight: 700;
    }
    .medal-info p { margin: 0; font-weight: 700; color: var(--text-main); font-size: 1.02rem; }
    .medal-info small { color: var(--text-muted); font-size: 0.75rem; display: block; margin-top: 0.25rem; }
    .medal-item.earned small { color: var(--success); font-weight: 600; }
  `]
})
export class MedalsShowcaseComponent {
  @Input() medals: KaizenMedal[] = [];

  allMedalTypes = [
    { type: 'daily', name: 'Medalla de Bronce' },
    { type: 'weekly', name: 'Medalla de Plata' },
    { type: 'monthly', name: 'Medalla de Oro' },
    { type: 'yearly', name: 'Medalla Corona' }
  ];

  isEarned(type: string): boolean {
    if (!this.medals) return false;
    return this.medals.some(m => m.type === type);
  }
}
