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
      background: rgba(17, 17, 17, 0.6);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.08);
      color: #eee;
      height: fit-content;
    }
    @media (min-width: 768px) {
      .medals-card {
        padding: 2.5rem;
      }
    }
    .medals-card h2 {
      margin-top: 0;
      color: #fff;
      font-weight: 700;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }
    .medals-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .medal-item {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 1.25rem;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }
    .medal-item:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: scale(1.02);
    }
    
    .medal-item.earned {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .medal-item.daily.earned { border-left: 4px solid #cd7f32; }
    .medal-item.weekly.earned { border-left: 4px solid #c0c0c0; }
    .medal-item.monthly.earned { border-left: 4px solid #ffd700; }
    .medal-item.yearly.earned { 
      border-left: 4px solid #b9f2ff; 
      background: linear-gradient(145deg, rgba(34, 34, 34, 0.8), rgba(26, 42, 58, 0.8)); 
    }
    
    .medal-item.locked {
      opacity: 0.4;
      filter: grayscale(100%);
    }
    
    .medal-icon {
      font-size: 2.2rem;
      margin-right: 1.25rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }
    .medal-info h4 {
      margin: 0 0 0.2rem 0;
      font-size: 0.75rem;
      color: #888;
      letter-spacing: 1.5px;
      font-weight: 700;
    }
    .medal-info p {
      margin: 0;
      font-weight: 700;
      color: #fff;
      font-size: 1.05rem;
    }
    .medal-info small {
      color: #666;
      font-size: 0.75rem;
      display: block;
      margin-top: 0.25rem;
    }
    .medal-item.earned small {
      color: #4ade80;
      font-weight: 600;
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
