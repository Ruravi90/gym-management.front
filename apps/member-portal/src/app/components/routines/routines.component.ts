import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutineService, ExerciseService, Routine, WorkoutSession, Exercise, DAYS_OF_WEEK } from '@shared';

@Component({
  selector: 'app-routines',
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Mis Rutinas</h1>
        <p>Tu plan de entrenamiento personalizado. Sigue tus días, registra tus series y consulta a tu mentor.</p>
        <div class="header-actions">
          <button routerLink="/rutinas/mentor" class="btn btn-primary">🤖 Preguntar a mi Mentor</button>
          <button routerLink="/rutinas/medidas" class="btn btn-outline">📏 Mis Medidas</button>
          <button (click)="openCreateModal()" class="btn btn-outline">+ Crear mi propia rutina</button>
        </div>
      </header>

      <div *ngIf="loading" class="loading">Cargando tus rutinas...</div>

      <div class="grid" *ngIf="!loading">
        <div class="card routine-card" *ngFor="let routine of routines">
          <div class="flex-between">
            <h3>{{ routine.name }}</h3>
            <span class="badge" [class.badge-success]="routine.is_active" [class.badge-neutral]="!routine.is_active">
              {{ routine.is_active ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <p class="muted" *ngIf="routine.description">{{ routine.description }}</p>
          <div class="days-summary">
            <span class="chip" *ngFor="let day of routine.days">{{ day.name }}</span>
            <span *ngIf="routine.days.length === 0" class="muted">Sin días definidos</span>
          </div>
          <button class="btn btn-primary btn-block mt-2" [routerLink]="['/rutinas', routine.id]" *ngIf="routine.is_active">Ver rutina y entrenar</button>
          <button class="btn btn-danger btn-block mt-2" (click)="deleteRoutine(routine)" *ngIf="!routine.is_active">Eliminar</button>
        </div>
        <div class="empty-state card" *ngIf="routines.length === 0">
          <div class="empty-icon">😴</div>
          <h3>Aún no tienes rutinas asignadas.</h3>
          <p class="muted">Pide a tu entrenador que te asigne una o crea la tuya propia.</p>
          <button (click)="openCreateModal()" class="btn btn-primary mt-2">+ Crear mi primera rutina</button>
        </div>
      </div>

      <section class="mt-3" *ngIf="sessions.length > 0">
        <h2 class="section-title">📈 Mi progreso reciente</h2>
        <div class="card session" *ngFor="let s of sessions">
          <div class="flex flex-wrap gap-sm" style="align-items: center;">
            <strong>{{ s.date | date:'fullDate' }}</strong>
            <span class="badge" [class.badge-success]="s.status === 'completed'" [class.badge-warning]="s.status !== 'completed'">
              {{ s.status === 'completed' ? 'Completada' : 'En progreso' }}
            </span>
          </div>
          <span class="muted">{{ s.set_logs.length }} series registradas</span>
          <button class="btn btn-outline btn-sm" [routerLink]="['/rutinas', s.routine_id]">Ver</button>
        </div>
      </section>
    </div>

    <!-- Modal crear rutina propia -->
    <div class="modal-overlay" *ngIf="showModal" (click.self)="closeModal()">
      <div class="modal">
        <h2>Nueva Rutina</h2>
        <label class="field">Nombre *
          <input type="text" class="app-input" [(ngModel)]="form.name" placeholder="Ej. Full Body">
        </label>
        <label class="field">Descripción
          <input type="text" class="app-input" [(ngModel)]="form.description" placeholder="Objetivo...">
        </label>

        <div class="flex-between section-title">
          <h3>Días</h3>
          <button class="btn btn-outline btn-sm" (click)="addDay()">+ Día</button>
        </div>
        <div class="day-editor" *ngFor="let day of form.days; let di = index">
          <div class="day-header">
            <input type="text" class="app-input" [(ngModel)]="day.name" placeholder="Nombre del día">
            <select class="app-input" [(ngModel)]="day.day_of_week">
              <option [ngValue]="null">Día flexible</option>
              <option *ngFor="let d of daysOfWeek; let i = index" [ngValue]="i">{{ d }}</option>
            </select>
            <button class="btn btn-danger btn-sm" (click)="removeDay(di)">✕</button>
          </div>
          <div class="day-exercise" *ngFor="let re of day.exercises; let ei = index">
            <span>{{ exerciseName(re.exercise_id) }}</span>
            <span class="muted">{{ re.sets }} × {{ re.reps }}</span>
            <button class="btn btn-danger btn-sm" (click)="removeExercise(di, ei)">✕</button>
          </div>
          <div class="picker" *ngIf="pickerDayIndex === di">
            <select class="app-input" [(ngModel)]="picker.exercise_id">
              <option [ngValue]="null" disabled>Selecciona un ejercicio...</option>
              <option *ngFor="let ex of exercises" [ngValue]="ex.id">{{ ex.name }}</option>
            </select>
            <div class="picker-fields">
              <input type="number" min="1" class="app-input" [(ngModel)]="picker.sets" placeholder="Series">
              <input type="text" class="app-input" [(ngModel)]="picker.reps" placeholder="Reps">
              <input type="text" class="app-input" [(ngModel)]="picker.weight" placeholder="Peso">
            </div>
            <div class="picker-actions">
              <button class="btn btn-ghost btn-sm" (click)="pickerDayIndex = -1">Cancelar</button>
              <button class="btn btn-primary btn-sm" (click)="addExercise(di)">Agregar</button>
            </div>
          </div>
          <button class="btn btn-outline btn-sm btn-add-exercise" (click)="pickerDayIndex = pickerDayIndex === di ? -1 : di">
            + Ejercicio
          </button>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="saveRoutine()">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .routine-card h3 { margin: 0; }
    .days-summary { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.9rem 0 0.25rem; }
    .section-title { font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; }
    .session {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding: 0.9rem 1.2rem;
      margin-bottom: 0.6rem;
      box-shadow: var(--shadow-xs);
    }
    .section-title { margin-top: 1.75rem; }

    .day-editor {
      background: var(--slate-50);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-md);
      padding: 0.85rem;
      margin-bottom: 0.75rem;
    }
    .day-header { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
    .day-header .app-input:first-child { flex: 1; min-width: 140px; }
    .day-exercise {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0;
      border-bottom: 1px solid var(--app-border);
      font-size: 0.88rem;
    }
    .picker {
      background: var(--app-primary-soft);
      border: 1px solid var(--app-primary-soft-border);
      border-radius: var(--radius-md);
      padding: 0.85rem;
      margin: 0.5rem 0;
    }
    .picker .app-input { width: 100%; margin-bottom: 0.5rem; }
    .picker-fields { display: flex; gap: 0.5rem; }
    .picker-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .btn-add-exercise { margin-top: 0.4rem; }
  `]
})
export class RoutinesComponent implements OnInit {
  routines: Routine[] = [];
  sessions: WorkoutSession[] = [];
  exercises: Exercise[] = [];
  loading = true;
  daysOfWeek = DAYS_OF_WEEK;

  showModal = false;
  form: any = { name: '', description: '', days: [] };
  pickerDayIndex = -1;
  picker: any = { exercise_id: null, sets: 3, reps: '10', weight: '' };

  constructor(
    private routineService: RoutineService,
    private exerciseService: ExerciseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.routineService.getMySessions(10).subscribe({
      next: (data) => this.sessions = data,
      error: (err) => console.error('Error loading sessions:', err)
    });
    this.exerciseService.getExercises().subscribe({
      next: (data) => this.exercises = data,
      error: (err) => console.error('Error loading exercises:', err)
    });
  }

  loadData(): void {
    this.loading = true;
    this.routineService.getMyRoutines().subscribe({
      next: (data) => { this.routines = data; this.loading = false; },
      error: (err) => { console.error('Error loading routines:', err); this.loading = false; }
    });
  }

  openCreateModal(): void {
    this.form = { name: '', description: '', days: [] };
    this.pickerDayIndex = -1;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addDay(): void {
    this.form.days.push({ name: `Día ${this.form.days.length + 1}`, day_of_week: null, exercises: [] });
  }

  removeDay(index: number): void {
    this.form.days.splice(index, 1);
  }

  addExercise(dayIndex: number): void {
    if (!this.picker.exercise_id) { alert('Selecciona un ejercicio'); return; }
    this.form.days[dayIndex].exercises.push({
      exercise_id: Number(this.picker.exercise_id),
      sets: Number(this.picker.sets) || 3,
      reps: this.picker.reps || '10',
      weight: this.picker.weight || null,
      rest_seconds: 60,
      notes: null,
      order: this.form.days[dayIndex].exercises.length
    });
    this.picker = { exercise_id: null, sets: 3, reps: '10', weight: '' };
    this.pickerDayIndex = -1;
  }

  removeExercise(dayIndex: number, exerciseIndex: number): void {
    this.form.days[dayIndex].exercises.splice(exerciseIndex, 1);
  }

  exerciseName(id: number): string {
    const found = this.exercises.find(e => e.id === id);
    return found ? found.name : `#${id}`;
  }

  saveRoutine(): void {
    if (!this.form.name) { alert('El nombre es obligatorio'); return; }
    const payload = {
      name: this.form.name,
      description: this.form.description || null,
      days: this.form.days.map((d: any) => ({
        name: d.name,
        day_of_week: d.day_of_week !== null && d.day_of_week !== '' ? Number(d.day_of_week) : null,
        order: 0,
        exercises: d.exercises.map((e: any) => ({
          exercise_id: e.exercise_id,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight || null,
          rest_seconds: e.rest_seconds || 60,
          notes: e.notes || null,
          order: 0
        }))
      }))
    };
    this.routineService.createRoutine(payload).subscribe({
      next: () => { this.closeModal(); this.loadData(); },
      error: (err) => {
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        alert('Error: ' + message);
      }
    });
  }

  deleteRoutine(routine: Routine): void {
    if (confirm(`¿Eliminar la rutina "${routine.name}"?`)) {
      this.routineService.deleteRoutine(routine.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }
}
