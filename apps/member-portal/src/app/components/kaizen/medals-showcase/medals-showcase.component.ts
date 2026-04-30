import { Component, Input } from '@angular/core';
import { KaizenMedal } from '../kaizen.service';

@Component({
  selector: 'app-medals-showcase',
  template: `
    <div class="medals-card">
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
    .medals-card {
      background: #111;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
      border: 1px solid rgba(255,255,255,0.05);
      color: #eee;
      height: fit-content;
    }
    .medals-card h2 {
      margin-top: 0;
      color: #fff;
      font-weight: 600;
      border-bottom: 2px solid #333;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .empty-state {
      text-align: center;
      padding: 2rem 0;
      opacity: 0.6;
    }
    .empty-state .icon {
      font-size: 4rem;
      filter: grayscale(100%);
      margin-bottom: 1rem;
    }
    .medals-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .medal-item {
      display: flex;
      align-items: center;
      background: #222;
      border-radius: 12px;
      padding: 1rem;
      position: relative;
      overflow: hidden;
      border-left: 4px solid #fff;
    }
    .medal-item::before {
      content: '';
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .medal-item:hover::before {
      opacity: 1;
    }
    .medal-item.daily.earned { border-left-color: #cd7f32; }
    .medal-item.weekly.earned { border-left-color: #c0c0c0; }
    .medal-item.monthly.earned { border-left-color: #ffd700; }
    .medal-item.yearly.earned { border-left-color: #b9f2ff; background: linear-gradient(145deg, #222, #1a2a3a); }
    
    .medal-item.locked {
      opacity: 0.4;
      filter: grayscale(100%);
      border-left-color: #444;
    }
    
    .medal-icon {
      font-size: 2.5rem;
      margin-right: 1rem;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));
    }
    .medal-info h4 {
      margin: 0 0 0.2rem 0;
      font-size: 0.9rem;
      color: #aaa;
      letter-spacing: 1px;
    }
    .medal-info p {
      margin: 0;
      font-weight: 600;
      color: #fff;
      font-size: 1rem;
    }
    .medal-info small {
      color: #666;
      font-size: 0.8rem;
    }
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
