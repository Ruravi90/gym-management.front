import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KaizenHabit, KaizenService } from '../kaizen.service';

@Component({
  selector: 'app-habit-tracker',
  template: `
    <div class="card tracker-card">
      <div class="card-header">
        <h2>Hábitos del Mes</h2>
        <button class="btn btn-primary btn-sm" (click)="addHabit()">
          <span class="plus-icon">+</span> Nuevo Hábito
        </button>
      </div>

      <div class="habit-list">
        <div class="habit-item" *ngFor="let habit of habits" [class.is-expanded]="expandedHabitId === habit.id">
          <!-- Encabezado del Hábito: Título y Stats (Siempre visible) -->
          <div class="habit-top-row" (click)="toggleExpand(habit)">
            <div class="habit-title-container">
              <span class="expand-chevron" [class.rotated]="expandedHabitId === habit.id">▼</span>
              <h3 *ngIf="!habit['_isEditing']">{{ habit.name }}</h3>
              <input *ngIf="habit['_isEditing']" [(ngModel)]="habit.name" (click)="$event.stopPropagation()" (blur)="saveHabitName(habit)" (keyup.enter)="saveHabitName(habit)" class="app-input edit-name-input" autofocus>
              <button class="btn-icon-small" (click)="habit['_isEditing'] = true; $event.stopPropagation()" *ngIf="!habit['_isEditing']" title="Editar nombre">✏️</button>
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
              <button class="btn-icon-delete" (click)="deleteHabit(habit); $event.stopPropagation()" title="Eliminar">🗑️</button>
            </div>
          </div>

          <!-- Contenido Colapsable -->
          <div class="habit-details-container" *ngIf="expandedHabitId === habit.id">
            <!-- Meta del Hábito -->
            <div class="habit-goal-section">
              <div class="goal-input-wrapper">
                <span class="goal-label">META:</span>
                <input type="text" [(ngModel)]="habit.goal" (blur)="updateHabit(habit)" placeholder="Define tu objetivo del mes...">
              </div>
            </div>

            <!-- Grid de Días -->
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

            <!-- Acciones de Registro -->
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

            <!-- Reflexión -->
            <div class="reflection-section" *ngIf="selectedDay">
              <label class="section-label">Reflexión Diaria</label>
              <textarea [ngModel]="getDailyReflection(habit, selectedDay)"
                        (ngModelChange)="updateDailyReflection(habit, selectedDay, $event)"
                        placeholder="¿Cómo te fue hoy? ¿Qué podrías mejorar?"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .tracker-card { padding: 1.5rem; }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--app-border);
      padding-bottom: 1.1rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .card-header h2 { margin: 0; font-size: 1.35rem; font-weight: 800; }

    .habit-item {
      background: var(--slate-50);
      border-radius: var(--radius-lg);
      padding: 1.1rem 1.25rem;
      margin-bottom: 0.9rem;
      border: 1px solid var(--app-border);
      transition: all 0.2s;
      overflow: hidden;
    }
    .habit-item.is-expanded {
      background: var(--app-surface);
      border-color: var(--app-primary);
      box-shadow: var(--shadow-md);
    }

    .habit-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      flex-wrap: wrap;
    }
    .habit-item.is-expanded .habit-top-row {
      margin-bottom: 1.25rem;
      padding-bottom: 0.9rem;
      border-bottom: 1px solid var(--app-border);
    }

    .habit-title-container { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
    .expand-chevron { font-size: 0.65rem; opacity: 0.35; transition: transform 0.25s ease; }
    .expand-chevron.rotated { transform: rotate(180deg); opacity: 1; color: var(--lime-600); }
    .habit-title-container h3 { margin: 0; font-size: 1.1rem; font-weight: 700; flex: 1; }

    .habit-stats-compact { display: flex; gap: 0.5rem; align-items: center; }
    .stat-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.25rem 0.55rem;
      border-radius: var(--radius-sm);
      min-width: 44px;
      line-height: 1.2;
    }
    .stat-badge.vic { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success); }
    .stat-badge.der { background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger); }
    .stat-badge .label { font-size: 0.5rem; font-weight: 800; opacity: 0.7; letter-spacing: 0.05em; }
    .stat-badge .value { font-size: 0.9rem; font-weight: 900; }

    .habit-details-container { animation: fadeInDown 0.25s ease-out; }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .habit-goal-section { margin-bottom: 1.25rem; }
    .goal-input-wrapper {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-md);
      padding: 0.65rem 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .goal-input-wrapper:focus-within { border-color: var(--app-primary); box-shadow: var(--shadow-focus); }
    .goal-label { font-size: 0.65rem; font-weight: 900; color: var(--text-muted); letter-spacing: 1px; }
    .goal-input-wrapper input { background: transparent; border: none; color: var(--text-main); font-size: 0.95rem; width: 100%; outline: none; font-family: var(--font-sans); }

    .days-container { margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
    .days-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(38px, 1fr)); gap: 7px; }

    .day-cell {
      aspect-ratio: 1;
      background: var(--app-surface);
      border: 1px solid var(--app-border-strong);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.15s;
    }
    .day-cell:hover { border-color: var(--app-primary); transform: scale(1.05); }
    .day-cell.is-selected {
      border: 2px solid var(--lime-600);
      box-shadow: 0 0 0 3px var(--app-primary-soft);
      transform: scale(1.08);
      z-index: 2;
    }
    .day-cell.is-vic {
      background: var(--success);
      color: #fff;
      border-color: var(--success);
    }
    .day-cell.is-der {
      background: var(--danger);
      color: #fff;
      border-color: var(--danger);
    }

    .action-section {
      text-align: center;
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: var(--slate-50);
      border-radius: var(--radius-lg);
      border: 1px solid var(--app-border);
    }
    .action-prompt {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      margin: 0 0 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .log-button-group { display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap; }

    .btn-action {
      flex: 1;
      max-width: 170px;
      padding: 0.9rem 1rem;
      border-radius: var(--radius-lg);
      border: 2px solid var(--app-border-strong);
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      background: var(--app-surface);
      color: var(--text-muted);
      font-family: var(--font-sans);
    }
    .btn-action .icon { font-size: 1.4rem; }
    .btn-victory:hover { border-color: var(--success); color: var(--success); background: var(--success-bg); }
    .btn-victory.active { background: var(--success); color: #fff; border-color: var(--success); box-shadow: 0 6px 16px rgb(22 163 74 / 0.25); }
    .btn-defeat:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-bg); }
    .btn-defeat.active { background: var(--danger); color: #fff; border-color: var(--danger); box-shadow: 0 6px 16px rgb(220 38 38 / 0.25); }

    .btn-reset {
      margin-top: 0.9rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      font-family: var(--font-sans);
    }
    .btn-reset:hover { color: var(--danger); }

    .reflection-section { display: flex; flex-direction: column; gap: 0.6rem; }
    .section-label { font-size: 0.7rem; font-weight: 900; color: var(--lime-700); text-transform: uppercase; letter-spacing: 1.5px; }
    .reflection-section textarea {
      background: var(--app-surface);
      border: 1px solid var(--app-border-strong);
      border-radius: var(--radius-md);
      padding: 0.9rem 1rem;
      color: var(--text-main);
      font-family: var(--font-sans);
      font-size: 0.95rem;
      line-height: 1.5;
      resize: vertical;
      min-height: 110px;
      transition: all 0.2s;
    }
    .reflection-section textarea:focus {
      outline: none;
      border-color: var(--app-primary);
      box-shadow: var(--shadow-focus);
    }

    .btn-icon-small, .btn-icon-delete {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-sm);
      padding: 4px 6px;
      cursor: pointer;
      opacity: 0.65;
      transition: all 0.15s;
      line-height: 1;
    }
    .btn-icon-small:hover, .btn-icon-delete:hover { opacity: 1; }
    .btn-icon-delete:hover { color: var(--danger); border-color: var(--danger); background: var(--danger-bg); }

    .edit-name-input { width: 100%; padding: 0.4rem 0.7rem; font-size: 1rem; font-weight: 700; }

    @media (max-width: 600px) {
      .habit-top-row { flex-wrap: wrap; }
      .habit-stats-compact { gap: 0.3rem; }
      .log-button-group { flex-direction: column; align-items: stretch; }
      .btn-action { max-width: none; }
    }
  `]
})
export class HabitTrackerComponent {
  @Input() habits: KaizenHabit[] = [];
  @Output() logUpdate = new EventEmitter<void>();

  selectedDay: number = new Date().getDate();
  expandedHabitId: any = null;

  constructor(private kaizenService: KaizenService) {}

  getDaysInMonth(): number[] {
    const today = new Date();
    const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array(days).fill(0);
  }

  toggleExpand(habit: KaizenHabit) {
    if (this.expandedHabitId === habit.id) {
      this.expandedHabitId = null; // Colapsar si ya está abierto
    } else {
      this.expandedHabitId = habit.id; // Abrir el nuevo
    }
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
