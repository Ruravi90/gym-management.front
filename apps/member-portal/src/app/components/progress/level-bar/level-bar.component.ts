import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../progress.service';
import { ProgressSummary } from '@shared/models/gamification.model';

@Component({
  selector: 'app-level-bar',
  template: `
    <div class="level-bar" *ngIf="progress">
      <div class="level-badge">
        <span class="level-number">{{ progress.level }}</span>
        <span class="level-label">NIVEL</span>
      </div>
      <div class="xp-info">
        <div class="xp-bar-container">
          <div class="xp-bar-fill" [style.width.%]="progress.xp_progress_percent"></div>
        </div>
        <div class="xp-text">
          <span class="xp-current">{{ progress.xp | number }} XP</span>
          <span class="xp-separator">/</span>
          <span class="xp-next">{{ progress.xp_for_next_level | number }} XP</span>
        </div>
      </div>
      <div class="streak-badge" *ngIf="progress.current_streak > 0">
        <span class="streak-icon">🔥</span>
        <span class="streak-number">{{ progress.current_streak }}</span>
      </div>
    </div>
  `,
  styles: [`
    .level-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      padding: 0.75rem 1.25rem;
      width: 100%;
      margin-bottom: 1.25rem;
    }

    .level-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-dark) 100%);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .level-number {
      color: white;
      font-size: 1.2rem;
      font-weight: 800;
      line-height: 1;
    }

    .level-label {
      color: rgba(255,255,255,0.8);
      font-size: 0.45rem;
      font-weight: 700;
      letter-spacing: 1px;
      line-height: 1;
    }

    .xp-info {
      flex: 1;
      min-width: 0;
    }

    .xp-bar-container {
      height: 8px;
      background: var(--slate-100);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.3rem;
    }

    .xp-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--app-primary) 0%, var(--app-primary-light) 100%);
      border-radius: 4px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .xp-text {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
      font-size: 0.75rem;
    }

    .xp-current {
      font-weight: 700;
      color: var(--app-primary);
    }

    .xp-separator {
      color: var(--text-muted);
    }

    .xp-next {
      color: var(--text-muted);
    }

    .streak-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
      padding: 0.4rem 0.7rem;
      border-radius: var(--radius-lg);
      flex-shrink: 0;
    }

    .streak-icon {
      font-size: 1rem;
    }

    .streak-number {
      color: white;
      font-size: 0.9rem;
      font-weight: 800;
    }
  `]
})
export class LevelBarComponent implements OnInit {
  progress: ProgressSummary | null = null;

  constructor(private gamificationService: GamificationService) {}

  ngOnInit() {
    this.gamificationService.getProgress().subscribe({
      next: (data) => this.progress = data,
      error: () => {} // Silently fail - dashboard still works without gamification
    });
  }
}
