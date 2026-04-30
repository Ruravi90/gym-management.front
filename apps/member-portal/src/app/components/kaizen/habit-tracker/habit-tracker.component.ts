import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KaizenHabit, KaizenService } from '../kaizen.service';

@Component({
  selector: 'app-habit-tracker',
  template: `
    <div class="tracker-card">
      <div class="card-header">
        <h2>Hábitos del Mes</h2>
        <button class="btn-add-habit" (click)="addHabit()">
          <span class="plus-icon">+</span> Nuevo Hábito
        </button>
      </div>
      
      <div class="habit-list">
        <div class="habit-item" *ngFor="let habit of habits">
          <!-- Encabezado del Hábito: Título y Stats -->
          <div class="habit-top-row">
            <div class="habit-title-container">
              <h3 *ngIf="!habit['_isEditing']" (click)="habit['_isEditing'] = true">{{ habit.name }}</h3>
              <input *ngIf="habit['_isEditing']" [(ngModel)]="habit.name" (blur)="saveHabitName(habit)" (keyup.enter)="saveHabitName(habit)" class="edit-name-input" autofocus>
              <button class="btn-icon-small" (click)="habit['_isEditing'] = true" *ngIf="!habit['_isEditing']">✏️</button>
            </div>
            <div class="habit-stats-compact">
              <div class="stat-badge vic">
                <span class="label">VIC</span>
                <span class="value">{{ getVicCount(habit) }}</span>
              </div>
              <div class="stat-badge der">
                <span class="label">DER</span>
                <span class="value">{{ getDerCount(habit) }}</span>
              </div>
              <button class="btn-icon-delete" (click)="deleteHabit(habit)" title="Eliminar">🗑️</button>
            </div>
          </div>

          <!-- Meta del Hábito: Inmediatamente debajo del título -->
          <div class="habit-goal-section">
            <div class="goal-input-wrapper">
              <span class="goal-label">META:</span>
              <input type="text" [(ngModel)]="habit.goal" (blur)="updateHabit(habit)" placeholder="Define tu objetivo del mes...">
            </div>
          </div>
          
          <!-- Grid de Días: El progreso visual -->
          <div class="days-container">
            <div class="days-grid">
              <div class="day-cell" *ngFor="let day of getDaysInMonth(); let i = index" 
                   [class.is-vic]="getLogStatus(habit, i + 1) === 'victory'"
                   [class.is-der]="getLogStatus(habit, i + 1) === 'defeat'"
                   [class.is-selected]="selectedDay === i + 1"
                   (click)="selectDay(i + 1)">
                {{ i + 1 }}
              </div>
            </div>
          </div>

          <!-- Acciones de Registro: Botones grandes y centrales -->
          <div class="action-section" *ngIf="selectedDay">
            <p class="action-prompt">Registrar día {{ selectedDay }}</p>
            <div class="log-button-group">
              <button class="btn-action btn-victory" 
                      [class.active]="getLogStatus(habit, selectedDay) === 'victory'" 
                      (click)="setLogStatus(habit, selectedDay, 'victory')">
                <span class="icon">🏆</span> Victoria
              </button>
              <button class="btn-action btn-defeat" 
                      [class.active]="getLogStatus(habit, selectedDay) === 'defeat'" 
                      (click)="setLogStatus(habit, selectedDay, 'defeat')">
                <span class="icon">💀</span> Derrota
              </button>
            </div>
            <button class="btn-reset" *ngIf="getLogStatus(habit, selectedDay) !== 'pending'" (click)="setLogStatus(habit, selectedDay, 'pending')">
              Restablecer día
            </button>
          </div>
          
          <!-- Reflexión: Espacio amplio para escribir -->
          <div class="reflection-section" *ngIf="selectedDay">
            <label class="section-label">Reflexión Diaria</label>
            <textarea [ngModel]="getDailyReflection(habit, selectedDay)" 
                      (ngModelChange)="updateDailyReflection(habit, selectedDay, $event)" 
                      placeholder="¿Cómo te fue hoy? ¿Qué podrías mejorar?"></textarea>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    .tracker-card {
      background: rgba(18, 18, 18, 0.7);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-radius: 32px;
      padding: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1.25rem;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #aaa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .btn-add-habit {
      background: rgba(249, 212, 35, 0.1);
      color: #f9d423;
      border: 1px solid rgba(249, 212, 35, 0.3);
      padding: 0.6rem 1.2rem;
      border-radius: 14px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-add-habit:hover {
      background: #f9d423;
      color: #000;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(249, 212, 35, 0.2);
    }

    .habit-item {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 28px;
      padding: 1.75rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .habit-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .habit-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .habit-title-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .habit-title-container h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: #f9d423;
      cursor: pointer;
    }

    .habit-stats-compact {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .stat-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.4rem 0.8rem;
      border-radius: 12px;
      min-width: 50px;
    }

    .stat-badge.vic { background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.2); color: #4ade80; }
    .stat-badge.der { background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.2); color: #f87171; }

    .stat-badge .label { font-size: 0.6rem; font-weight: 800; opacity: 0.7; }
    .stat-badge .value { font-size: 1rem; font-weight: 900; }

    .habit-goal-section {
      margin-bottom: 1.5rem;
    }

    .goal-input-wrapper {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .goal-label {
      font-size: 0.7rem;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 1px;
    }

    .goal-input-wrapper input {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 0.95rem;
      width: 100%;
      outline: none;
    }

    .days-container {
      margin-bottom: 2rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      gap: 8px;
    }

    .day-cell {
      aspect-ratio: 1;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .day-cell:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.05); }
    
    .day-cell.is-selected {
      border: 2px solid #f9d423;
      box-shadow: 0 0 15px rgba(249, 212, 35, 0.3);
      transform: scale(1.1);
      z-index: 2;
    }

    .day-cell.is-vic {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: #052e16;
      border: none;
    }

    .day-cell.is-der {
      background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
      color: #fff;
      border: none;
    }

    .action-section {
      text-align: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .action-prompt {
      font-size: 0.8rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .log-button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-action {
      flex: 1;
      max-width: 160px;
      padding: 1rem;
      border-radius: 18px;
      border: 2px solid transparent;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
    }

    .btn-action .icon { font-size: 1.5rem; }

    .btn-victory:hover { background: rgba(74, 222, 128, 0.1); border-color: rgba(74, 222, 128, 0.3); color: #4ade80; }
    .btn-victory.active { background: #4ade80; color: #052e16; transform: scale(1.05); box-shadow: 0 10px 25px rgba(74, 222, 128, 0.3); }

    .btn-defeat:hover { background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.3); color: #f87171; }
    .btn-defeat.active { background: #f87171; color: #fff; transform: scale(1.05); box-shadow: 0 10px 25px rgba(248, 113, 113, 0.3); }

    .btn-reset {
      margin-top: 1rem;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }

    .reflection-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 900;
      color: #f9d423;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .reflection-section textarea {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      padding: 1.25rem;
      color: #eee;
      font-family: inherit;
      font-size: 0.95rem;
      line-height: 1.5;
      resize: vertical;
      min-height: 120px;
      transition: all 0.3s;
    }

    .reflection-section textarea:focus {
      outline: none;
      border-color: #f9d423;
      background: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 0 4px rgba(249, 212, 35, 0.1);
    }

    .btn-icon-small, .btn-icon-delete {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      border-radius: 8px;
      padding: 5px;
      cursor: pointer;
      opacity: 0.5;
      transition: all 0.2s;
    }

    .btn-icon-small:hover, .btn-icon-delete:hover { opacity: 1; background: rgba(255, 255, 255, 0.1); }
    .btn-icon-delete:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }

    .edit-name-input {
      background: rgba(0, 0, 0, 0.3);
      border: 2px solid #f9d423;
      color: #f9d423;
      padding: 0.4rem 0.8rem;
      border-radius: 10px;
      font-size: 1.3rem;
      font-weight: 800;
      width: 100%;
    }

    @media (max-width: 600px) {
      .habit-top-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .habit-stats-compact { width: 100%; justify-content: space-between; }
      .log-button-group { flex-direction: column; align-items: stretch; }
      .btn-action { max-width: none; }
    }
  `]
})
export class HabitTrackerComponent {
  @Input() habits: KaizenHabit[] = [];
  @Output() logUpdate = new EventEmitter<void>();

  selectedDay: number = new Date().getDate();

  constructor(private kaizenService: KaizenService) {}

  getDaysInMonth(): number[] {
    const today = new Date();
    const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array(days).fill(0);
  }

  selectDay(day: number) {
    this.selectedDay = day;
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

  setLogStatus(habit: KaizenHabit, day: number, status: 'pending' | 'victory' | 'defeat') {
    if (!habit.id) return;
    
    const dateStr = this.formatDate(day);
    const currentLog = habit.logs?.find(l => l.date === dateStr);
    const reflection = currentLog?.reflection || '';

    this.kaizenService.recordLog(habit.id, dateStr, status, reflection).subscribe({
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

  toggleLog(habit: KaizenHabit, day: number) {
    this.selectDay(day);
    const currentStatus = this.getLogStatus(habit, day);
    let nextStatus: 'pending' | 'victory' | 'defeat' = 'victory';
    if (currentStatus === 'victory') nextStatus = 'defeat';
    else if (currentStatus === 'defeat') nextStatus = 'pending';
    
    this.setLogStatus(habit, day, nextStatus);
  }

  getDailyReflection(habit: KaizenHabit, day: number): string {
    const dateStr = this.formatDate(day);
    const log = habit.logs?.find(l => l.date === dateStr);
    return log?.reflection || '';
  }

  updateDailyReflection(habit: KaizenHabit, day: number, reflection: string) {
    if (!habit.id) return;
    const dateStr = this.formatDate(day);
    const currentStatus = this.getLogStatus(habit, day) as any;
    
    this.kaizenService.recordLog(habit.id, dateStr, currentStatus, reflection).subscribe({
      next: () => {
        // No emit to avoid flickering the whole UI while typing, 
        // but we need the local model to be updated.
        const log = habit.logs?.find(l => l.date === dateStr);
        if (log) log.reflection = reflection;
      }
    });
  }

  updateHabit(habit: any) {
    if (habit.id) {
      this.kaizenService.updateHabit(habit.id, { goal: habit.goal }).subscribe();
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
