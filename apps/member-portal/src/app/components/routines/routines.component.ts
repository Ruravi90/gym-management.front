import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutineService, ExerciseService, Routine, WorkoutSession, Exercise, DAYS_OF_WEEK } from '@shared';

@Component({
  selector: 'app-routines',
  template: `
    <div class="container">
      <header class="header">
        <div class="back-row">
          <button routerLink="/dashboard" class="btn-back">⬅️ Volver al Dashboard</button>
        </div>
        <h1>Mis Rutinas 🏋️</h1>
        <p>Tu plan de entrenamiento personalizado. Sigue tus días, registra tus series y consulta a tu mentor.</p>
        <div class="header-actions">
          <button routerLink="/rutinas/mentor" class="btn-primary">🤖 Preguntar a mi Mentor</button>
          <button routerLink="/rutinas/medidas" class="btn-outline">📏 Mis Medidas</button>
          <button (click)="openCreateModal()" class="btn-outline">+ Crear mi propia rutina</button>
        </div>
      </header>

      <div *ngIf="loading" class="loading">Cargando tus rutinas...</div>

      <div class="grid" *ngIf="!loading">
        <div class="routine-card" *ngFor="let routine of routines">
          <div class="routine-card-header">
            <h3>{{ routine.name }}</h3>
            <span class="badge" [class.badge-inactive]="!routine.is_active">{{ routine.is_active ? 'Activa' : 'Inactiva' }}</span>
          </div>
          <p class="desc" *ngIf="routine.description">{{ routine.description }}</p>
          <div class="days-summary">
            <span class="chip" *ngFor="let day of routine.days">{{ day.name }}</span>
            <span *ngIf="routine.days.length === 0" class="muted">Sin días definidos</span>
          </div>
          <button class="btn-view" [routerLink]="['/rutinas', routine.id]" *ngIf="routine.is_active">Ver rutina y entrenar</button>
          <button class="btn-view btn-view-muted" (click)="deleteRoutine(routine)" *ngIf="!routine.is_active">Eliminar</button>
        </div>
        <div class="empty-state" *ngIf="routines.length === 0">
          <p>😴 Aún no tienes rutinas asignadas.</p>
          <p class="muted">Pide a tu entrenador que te asigne una o crea la tuya propia.</p>
          <button (click)="openCreateModal()" class="btn-primary">+ Crear mi primera rutina</button>
        </div>
      </div>

      <section class="history" *ngIf="sessions.length > 0">
        <h2>📈 Mi progreso reciente</h2>
        <div class="session" *ngFor="let s of sessions">
          <div>
            <strong>{{ s.date | date:'fullDate' }}</strong>
            <span class="chip" [class.chip-done]="s.status === 'completed'">{{ s.status === 'completed' ? 'Completada' : 'En progreso' }}</span>
          </div>
          <span class="muted">{{ s.set_logs.length }} series registradas</span>
          <button class="btn-small" [routerLink]="['/rutinas', s.routine_id]">Ver</button>
        </div>
      </section>
    </div>

    <!-- Modal crear rutina propia -->
    <div class="modal-overlay" *ngIf="showModal" (click.self)="closeModal()">
      <div class="modal">
        <h2>Nueva Rutina</h2>
        <label>Nombre *
          <input type="text" class="input" [(ngModel)]="form.name" placeholder="Ej. Full Body">
        </label>
        <label>Descripción
          <input type="text" class="input" [(ngModel)]="form.description" placeholder="Objetivo...">
        </label>

        <div class="section-title">
          <h3>Días</h3>
          <button class="btn-small" (click)="addDay()">+ Día</button>
        </div>
        <div class="day-editor" *ngFor="let day of form.days; let di = index">
          <div class="day-header">
            <input type="text" class="input" [(ngModel)]="day.name" placeholder="Nombre del día">
            <select class="input" [(ngModel)]="day.day_of_week">
              <option [ngValue]="null">Día flexible</option>
              <option *ngFor="let d of daysOfWeek; let i = index" [ngValue]="i">{{ d }}</option>
            </select>
            <button class="btn-danger" (click)="removeDay(di)">✕</button>
          </div>
          <div class="day-exercise" *ngFor="let re of day.exercises; let ei = index">
            <span>{{ exerciseName(re.exercise_id) }}</span>
            <span class="muted">{{ re.sets }} × {{ re.reps }}</span>
            <button class="btn-danger" (click)="removeExercise(di, ei)">✕</button>
          </div>
          <div class="picker" *ngIf="pickerDayIndex === di">
            <select class="input" [(ngModel)]="picker.exercise_id">
              <option [ngValue]="null" disabled>Selecciona un ejercicio...</option>
              <option *ngFor="let ex of exercises" [ngValue]="ex.id">{{ ex.name }}</option>
            </select>
            <div class="picker-fields">
              <input type="number" min="1" class="input" [(ngModel)]="picker.sets" placeholder="Series">
              <input type="text" class="input" [(ngModel)]="picker.reps" placeholder="Reps">
              <input type="text" class="input" [(ngModel)]="picker.weight" placeholder="Peso">
            </div>
            <div class="picker-actions">
              <button class="btn-small" (click)="pickerDayIndex = -1">Cancelar</button>
              <button class="btn-primary" (click)="addExercise(di)">Agregar</button>
            </div>
          </div>
          <button class="btn-small btn-add-exercise" (click)="pickerDayIndex = pickerDayIndex === di ? -1 : di">
            + Ejercicio
          </button>
        </div>

        <div class="modal-actions">
          <button class="btn-outline" (click)="closeModal()">Cancelar</button>
          <button class="btn-primary" (click)="saveRoutine()">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 1rem; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #eee; min-height: 100vh; }
    .header { text-align: center; background: rgba(18,18,18,0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 2rem 1.5rem; margin-bottom: 1.5rem; }
    .header h1 { font-size: 2rem; margin: 0 0 0.5rem; background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header p { color: #aaa; max-width: 560px; margin: 0 auto; }
    .back-row { text-align: left; margin-bottom: 1rem; }
    .btn-back { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.6rem 1.2rem; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; }
    .header-actions { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem; flex-wrap: wrap; }
    .btn-primary { background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 18px; font-weight: 800; cursor: pointer; font-size: 0.95rem; }
    .btn-outline { background: transparent; color: #eee; border: 1px solid rgba(255,255,255,0.2); padding: 0.75rem 1.5rem; border-radius: 18px; font-weight: 600; cursor: pointer; font-size: 0.95rem; }
    .btn-small { background: rgba(255,255,255,0.08); color: #eee; border: none; padding: 0.4rem 0.9rem; border-radius: 10px; cursor: pointer; font-size: 0.8rem; }
    .btn-danger { background: rgba(255,78,80,0.15); color: #ff6b6b; border: none; padding: 0.3rem 0.6rem; border-radius: 8px; cursor: pointer; }
    .loading { text-align: center; color: #aaa; padding: 3rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
    .routine-card { background: rgba(18,18,18,0.7); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 1.25rem; transition: all 0.3s; }
    .routine-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); }
    .routine-card-header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .routine-card h3 { margin: 0; color: #fff; font-size: 1.15rem; }
    .badge { background: rgba(74,222,128,0.15); color: #4ade80; font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 8px; }
    .badge-inactive { background: rgba(255,78,80,0.15); color: #ff6b6b; }
    .desc { color: #999; font-size: 0.9rem; }
    .days-summary { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.75rem 0; }
    .chip { background: rgba(249,212,35,0.12); color: #f9d423; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 8px; }
    .chip-done { background: rgba(74,222,128,0.15); color: #4ade80; }
    .muted { color: #888; font-size: 0.85rem; }
    .btn-view { width: 100%; margin-top: 0.75rem; background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; border: none; padding: 0.7rem; border-radius: 14px; font-weight: 700; cursor: pointer; }
    .btn-view-muted { background: rgba(255,78,80,0.15); color: #ff6b6b; }
    .empty-state { grid-column: 1 / -1; text-align: center; color: #aaa; padding: 3rem; background: rgba(18,18,18,0.5); border-radius: 20px; }
    .history { margin-top: 2rem; }
    .history h2 { color: #fff; }
    .session { display: flex; justify-content: space-between; align-items: center; gap: 1rem; background: rgba(18,18,18,0.7); border-radius: 14px; padding: 0.9rem 1.1rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; justify-content: center; padding: 2rem; z-index: 100; overflow-y: auto; }
    .modal { background: #161616; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 1.5rem; width: 100%; max-width: 620px; color: #eee; height: fit-content; }
    .modal h2 { color: #f9d423; margin-top: 0; }
    .modal label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; color: #bbb; margin-bottom: 0.75rem; }
    .input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #eee; padding: 0.6rem 0.9rem; font-size: 0.9rem; outline: none; }
    .input:focus { border-color: #f9d423; }
    .section-title { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
    .section-title h3 { color: #fff; margin: 0; }
    .day-editor { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.75rem; margin-bottom: 0.75rem; }
    .day-header { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .day-header .input { flex: 1; }
    .day-exercise { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; }
    .picker { background: rgba(249,212,35,0.05); border: 1px solid rgba(249,212,35,0.3); border-radius: 10px; padding: 0.75rem; margin-bottom: 0.5rem; }
    .picker .input { width: 100%; margin-bottom: 0.5rem; }
    .picker-fields { display: flex; gap: 0.5rem; }
    .picker-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .btn-add-exercise { margin-top: 0.4rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    @media (min-width: 768px) { .container { padding: 2rem; } }
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
