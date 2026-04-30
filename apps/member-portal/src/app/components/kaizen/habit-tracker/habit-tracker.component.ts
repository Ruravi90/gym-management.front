import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KaizenHabit, KaizenService } from '../kaizen.service';

@Component({
  selector: 'app-habit-tracker',
  template: `
    <div class="tracker-card">
      <h2>Hábitos del Mes</h2>
      
      <div class="habit-list">
        <div class="habit-item" *ngFor="let habit of habits">
          <div class="habit-header">
            <div class="habit-title-container" style="display: flex; align-items: center; gap: 0.5rem;">
              <h3 *ngIf="!habit['_isEditing']">{{ habit.name }}</h3>
              <input *ngIf="habit['_isEditing']" [(ngModel)]="habit.name" (blur)="saveHabitName(habit)" (keyup.enter)="saveHabitName(habit)" class="edit-name-input">
              <button class="btn-icon" (click)="habit['_isEditing'] = true" *ngIf="!habit['_isEditing']" title="Editar Nombre">✏️</button>
            </div>
            <div class="habit-stats" style="display: flex; align-items: center;">
              <span class="vic">VIC: {{ getVicCount(habit) }}</span>
              <span class="der">DER: {{ getDerCount(habit) }}</span>
              <button class="btn-icon btn-delete" (click)="deleteHabit(habit)" title="Eliminar Hábito">🗑️</button>
            </div>
          </div>
          
          <div class="days-grid">
            <div class="day" *ngFor="let day of getDaysInMonth(); let i = index" 
                 [class.vic]="getLogStatus(habit, i + 1) === 'victory'"
                 [class.der]="getLogStatus(habit, i + 1) === 'defeat'"
                 (click)="toggleLog(habit, i + 1)">
              {{ i + 1 }}
            </div>
          </div>
          
          <div class="habit-meta">
            <div class="input-group">
              <label>Reflexión</label>
              <textarea [(ngModel)]="habit.reflection" (blur)="updateHabit(habit)" placeholder="¿Qué aprendiste hoy?"></textarea>
            </div>
            <div class="input-group">
              <label>Meta</label>
              <input type="text" [(ngModel)]="habit.goal" (blur)="updateHabit(habit)" placeholder="Objetivo a lograr">
            </div>
          </div>
        </div>
      </div>

      <button class="btn-add" (click)="addHabit()">+ Nuevo Hábito</button>
    </div>
  `,
  styles: [`
    .tracker-card {
      background: #222;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.05);
      color: #eee;
    }
    .tracker-card h2 {
      margin-top: 0;
      color: #fff;
      font-weight: 600;
      border-bottom: 2px solid #333;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .habit-item {
      background: #2a2a2a;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .habit-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
    .habit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .habit-header h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #f9d423;
    }
    .habit-stats span {
      margin-left: 1rem;
      font-weight: bold;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }
    .vic { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
    .der { color: #f87171; background: rgba(248, 113, 113, 0.1); }
    
    .days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
      gap: 8px;
      margin-bottom: 1.5rem;
    }
    .day {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s;
    }
    .day:hover {
      background: #444;
      transform: scale(1.1);
    }
    .day.vic {
      background: #4ade80;
      color: #000;
      box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
    }
    .day.der {
      background: #f87171;
      color: #fff;
      box-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
    }
    .habit-meta {
      display: flex;
      gap: 1rem;
    }
    .input-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .input-group label {
      font-size: 0.85rem;
      color: #aaa;
      margin-bottom: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .input-group input, .input-group textarea {
      background: #1e1e1e;
      border: 1px solid #333;
      color: #fff;
      padding: 0.8rem;
      border-radius: 8px;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    .input-group input:focus, .input-group textarea:focus {
      outline: none;
      border-color: #f9d423;
    }
    .input-group textarea {
      resize: vertical;
      min-height: 42px;
    }
    .btn-add {
      background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%);
      color: #000;
      border: none;
      padding: 1rem 2rem;
      border-radius: 30px;
      font-weight: bold;
      cursor: pointer;
      width: 100%;
      font-size: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(249, 212, 35, 0.4);
    }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s, transform 0.2s;
      font-size: 1.1rem;
      padding: 4px;
    }
    .btn-icon:hover {
      opacity: 1;
      transform: scale(1.1);
    }
    .btn-delete {
      margin-left: 0.5rem;
    }
    .btn-delete:hover {
      color: #f87171;
    }
    .edit-name-input {
      background: #1e1e1e;
      border: 1px solid #f9d423;
      color: #f9d423;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: bold;
      outline: none;
    }
  `]
})
export class HabitTrackerComponent {
  @Input() habits: KaizenHabit[] = [];
  @Output() logUpdate = new EventEmitter<void>();

  constructor(private kaizenService: KaizenService) {}

  getDaysInMonth(): number[] {
    const today = new Date();
    const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array(days).fill(0);
  }

  getLogStatus(habit: KaizenHabit, day: number): string {
    if (!habit.logs) return 'pending';
    const dateStr = this.formatDate(day);
    const log = habit.logs.find(l => l.date === dateStr);
    return log ? log.status : 'pending';
  }

  getVicCount(habit: KaizenHabit): number {
    if (!habit.logs) return 0;
    return habit.logs.filter(l => l.status === 'victory').length;
  }

  getDerCount(habit: KaizenHabit): number {
    if (!habit.logs) return 0;
    return habit.logs.filter(l => l.status === 'defeat').length;
  }

  toggleLog(habit: KaizenHabit, day: number) {
    if (!habit.id) return;
    
    const currentStatus = this.getLogStatus(habit, day);
    let nextStatus: 'pending' | 'victory' | 'defeat' = 'victory';
    if (currentStatus === 'victory') nextStatus = 'defeat';
    else if (currentStatus === 'defeat') nextStatus = 'pending';

    const dateStr = this.formatDate(day);
    this.kaizenService.recordLog(habit.id, dateStr, nextStatus).subscribe({
      next: () => {
        this.logUpdate.emit();
      },
      error: (err) => {
        if (err.error && err.error.detail) {
          alert("⚠️ " + err.error.detail);
        } else {
          alert("Ocurrió un error al registrar el hábito.");
        }
      }
    });
  }

  updateHabit(habit: any) {
    if (habit.id) {
      this.kaizenService.updateHabit(habit.id, { reflection: habit.reflection, goal: habit.goal }).subscribe();
    }
  }

  saveHabitName(habit: any) {
    habit['_isEditing'] = false;
    if (habit.id) {
      this.kaizenService.updateHabit(habit.id, { name: habit.name }).subscribe();
    }
  }

  deleteHabit(habit: KaizenHabit) {
    if (habit.id && confirm(`¿Estás seguro de que deseas eliminar el hábito "${habit.name}"? Toda su historia se perderá.`)) {
      this.kaizenService.deleteHabit(habit.id).subscribe(() => {
        this.logUpdate.emit();
      });
    }
  }

  addHabit() {
    const name = prompt("Nombre del nuevo hábito:");
    if (name) {
      const today = new Date();
      this.kaizenService.createHabit({
        name,
        month: today.getMonth() + 1,
        year: today.getFullYear()
      }).subscribe(() => {
        this.logUpdate.emit();
      });
    }
  }

  private formatDate(day: number): string {
    const today = new Date();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${today.getFullYear()}-${m}-${d}`;
  }
}
