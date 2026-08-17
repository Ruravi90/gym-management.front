import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutineService, Routine, WorkoutSession, RoutineDay } from '@shared';

@Component({
  selector: 'app-routine-detail',
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="back-row">
          <button (click)="goBack()" class="btn btn-ghost btn-sm">← Volver a Mis Rutinas</button>
        </div>
        <h1>{{ routine?.name }}</h1>
        <p *ngIf="routine?.description">{{ routine.description }}</p>
        <div class="day-tabs" *ngIf="routine && routine.days.length > 1">
          <button *ngFor="let day of routine.days; let i = index" class="day-tab"
            [class.active]="selectedDayIndex === i" (click)="selectDay(i)">
            {{ day.name }}
          </button>
        </div>
      </header>

      <div *ngIf="loading" class="loading">Cargando rutina...</div>

      <ng-container *ngIf="routine && !loading">
        <!-- Vista normal: ejercicios del día -->
        <div *ngIf="!sessionMode">
          <div class="card" *ngIf="currentDay">
            <h2 class="day-title">{{ currentDay.name }} <span class="muted">{{ dayLabel }}</span></h2>
            <div class="exercise-list">
              <div class="exercise-row" *ngFor="let re of currentDay.exercises; let i = index">
                <div class="ex-media" (click)="showGif(re.exercise?.gif_url || '')">
                  <img *ngIf="re.exercise?.gif_url" [src]="re.exercise.gif_url" [alt]="re.exercise?.name" loading="lazy">
                  <span *ngIf="!re.exercise?.gif_url" class="ex-media-placeholder">🎥</span>
                </div>
                <div class="ex-info">
                  <h3>{{ re.exercise?.name || ('#' + re.exercise_id) }}</h3>
                  <p class="muted">
                    {{ re.sets }} series × {{ re.reps }}
                    <span *ngIf="re.weight"> · {{ re.weight }}</span>
                    <span *ngIf="re.rest_seconds"> · {{ re.rest_seconds }}s descanso</span>
                  </p>
                  <p *ngIf="re.notes" class="notes">📝 {{ re.notes }}</p>
                </div>
                <button class="btn btn-outline btn-sm" (click)="showGif(re.exercise?.gif_url || '')" *ngIf="re.exercise?.gif_url">Ver GIF</button>
              </div>
            </div>
            <button class="btn btn-primary btn-lg btn-block mt-3" (click)="startWorkout()" *ngIf="currentDay.exercises.length > 0">
              ▶️ Empezar entrenamiento
            </button>
          </div>
          <div class="empty-state" *ngIf="!currentDay">
            <p>Esta rutina aún no tiene días con ejercicios.</p>
          </div>
        </div>

        <!-- Modo entrenamiento: registrar series -->
        <div *ngIf="sessionMode && session">
          <div class="session-header">
            <h2>🏋️ Entrenando: {{ currentDay?.name || 'Sesión libre' }}</h2>
            <p class="muted">{{ session.date | date:'fullDate' }}</p>
          </div>

          <div class="card exercise-block" *ngFor="let ex of sessionExercises; let ei = index">
            <h3>{{ ex.exercise?.name || ('#' + ex.exercise_id) }}
              <span class="muted">({{ ex.sets }} × {{ ex.reps }})</span>
            </h3>
            <div class="set-table">
              <div class="set-row set-head">
                <span>Serie</span><span>Reps</span><span>Peso</span><span>Hecha</span><span></span>
              </div>
              <div class="set-row" *ngFor="let set of getSetsFor(ex); let si = index">
                <span class="set-num">{{ si + 1 }}</span>
                <input type="number" min="0" class="app-input" [(ngModel)]="set.reps" placeholder="Reps">
                <input type="text" class="app-input" [(ngModel)]="set.weight" placeholder="Peso">
                <input type="checkbox" class="set-check" [(ngModel)]="set.completed">
                <button class="btn btn-outline btn-sm" (click)="saveSet(ex, si)" [disabled]="set.saving">💾</button>
              </div>
            </div>
            <div class="saved" *ngIf="savedSets[ei]">✅ {{ savedSets[ei] }} series guardadas</div>
          </div>

          <button class="btn btn-success btn-lg btn-block" (click)="completeWorkout()" [disabled]="finishing">
            {{ finishing ? 'Guardando...' : '✔️ Terminar entrenamiento' }}
          </button>
        </div>
      </ng-container>
    </div>

    <!-- Modal GIF -->
    <div class="modal-overlay" *ngIf="gifUrl" (click.self)="gifUrl = ''">
      <div class="gif-modal">
        <img [src]="gifUrl" alt="Demostración del ejercicio">
        <button class="btn btn-outline mt-2" (click)="gifUrl = ''">Cerrar</button>
      </div>
    </div>
  `,
  styles: [`
    .day-tabs { display: flex; gap: 0.5rem; margin-top: 1.25rem; flex-wrap: wrap; }
    .day-tab {
      background: var(--app-surface);
      color: var(--text-muted);
      border: 1px solid var(--app-border-strong);
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.15s;
    }
    .day-tab:hover { border-color: var(--app-primary); color: var(--lime-700); }
    .day-tab.active {
      background: var(--app-primary);
      color: var(--app-on-primary);
      font-weight: 700;
      border-color: var(--app-primary);
    }

    .day-title { margin-top: 0; font-size: 1.4rem; }
    .exercise-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .exercise-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--slate-50);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-md);
      padding: 0.85rem;
    }
    .ex-media {
      width: 84px;
      height: 84px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--slate-100);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      border: 1px solid var(--app-border);
    }
    .ex-media img { width: 100%; height: 100%; object-fit: cover; }
    .ex-media-placeholder { font-size: 1.6rem; }
    .ex-info { flex: 1; min-width: 0; }
    .ex-info h3 { margin: 0 0 0.25rem; font-size: 1rem; }
    .notes { color: var(--lime-700); font-size: 0.85rem; margin: 0.3rem 0 0; }

    .session-header { margin-bottom: 1.25rem; }
    .session-header h2 { margin: 0 0 0.25rem; font-size: 1.4rem; }
    .exercise-block { margin-bottom: 1rem; }
    .exercise-block h3 { margin: 0 0 0.9rem; font-size: 1.05rem; }
    .set-table { display: flex; flex-direction: column; gap: 0.5rem; }
    .set-row {
      display: grid;
      grid-template-columns: 48px 1fr 1fr 56px 44px;
      gap: 0.5rem;
      align-items: center;
    }
    .set-head { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700; }
    .set-num { font-weight: 700; color: var(--text-muted); text-align: center; }
    .set-check { width: 18px; height: 18px; accent-color: var(--app-primary); cursor: pointer; justify-self: center; }
    .saved { color: var(--success); font-size: 0.82rem; margin-top: 0.75rem; font-weight: 600; }

    .gif-modal { text-align: center; }
    .gif-modal img {
      max-width: 92vw;
      max-height: 72vh;
      border-radius: var(--radius-lg);
      background: var(--slate-900);
      box-shadow: var(--shadow-lg);
    }

    @media (max-width: 560px) {
      .exercise-row { flex-wrap: wrap; }
      .ex-media { width: 64px; height: 64px; }
      .set-row { grid-template-columns: 36px 1fr 1fr 44px 40px; gap: 0.35rem; }
    }
  `]
})
export class RoutineDetailComponent implements OnInit {
  routine: Routine | null = null;
  loading = true;
  selectedDayIndex = 0;
  gifUrl = '';

  sessionMode = false;
  session: WorkoutSession | null = null;
  sessionExercises: any[] = [];
  setData: any = {};       // exerciseId -> array of {reps, weight, completed, saving}
  savedSets: number[] = []; // saved count per exercise index
  finishing = false;

  private routineId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private routineService: RoutineService
  ) { }

  ngOnInit(): void {
    this.routineId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRoutine();
  }

  loadRoutine(): void {
    this.loading = true;
    this.routineService.getRoutine(this.routineId).subscribe({
      next: (data) => { this.routine = data; this.loading = false; },
      error: (err) => {
        console.error('Error loading routine:', err);
        this.loading = false;
        alert('No se pudo cargar la rutina');
        this.router.navigate(['/rutinas']);
      }
    });
  }

  get currentDay(): RoutineDay | undefined {
    if (!this.routine || this.routine.days.length === 0) { return undefined; }
    return this.routine.days[this.selectedDayIndex] || this.routine.days[0];
  }

  get dayLabel(): string {
    const day = this.currentDay;
    if (!day || day.day_of_week === null || day.day_of_week === undefined) { return 'Día flexible'; }
    const names = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return names[day.day_of_week] || 'Día flexible';
  }

  selectDay(index: number): void {
    this.selectedDayIndex = index;
  }

  showGif(url: string): void {
    if (url) { this.gifUrl = url; }
  }

  goBack(): void {
    if (this.sessionMode) {
      this.sessionMode = false;
      this.session = null;
      return;
    }
    this.router.navigate(['/rutinas']);
  }

  // ---------- Entrenamiento ----------
  startWorkout(): void {
    const day = this.currentDay;
    if (!day) { return; }
    this.routineService.createSession({ routine_id: this.routine!.id, day_id: day.id }).subscribe({
      next: (session) => {
        this.session = session;
        this.sessionMode = true;
        this.setupExerciseTracking(day);
      },
      error: (err) => {
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        alert('Error al iniciar la sesión: ' + message);
      }
    });
  }

  setupExerciseTracking(day: RoutineDay): void {
    this.sessionExercises = day.exercises.map(re => ({
      exercise_id: re.exercise_id,
      exercise: re.exercise,
      sets: re.sets,
      reps: re.reps
    }));
    this.setData = {};
    this.savedSets = [];
    this.sessionExercises.forEach(() => this.savedSets.push(0));
    this.sessionExercises.forEach(ex => {
      this.setData[ex.exercise_id] = [];
      for (let i = 0; i < ex.sets; i++) {
        this.setData[ex.exercise_id].push({ reps: null, weight: '', completed: false, saving: false });
      }
    });
  }

  getSetsFor(ex: any): any[] {
    return this.setData[ex.exercise_id] || [];
  }

  saveSet(ex: any, setIndex: number): void {
    const set = this.setData[ex.exercise_id][setIndex];
    set.saving = true;
    const payload = {
      exercise_id: ex.exercise_id,
      set_number: setIndex + 1,
      reps: set.reps !== null && set.reps !== '' ? Number(set.reps) : null,
      weight: set.weight || null,
      completed: set.completed
    };
    this.routineService.addSetLog(this.session!.id, payload).subscribe({
      next: () => {
        set.saving = false;
        const exIndex = this.sessionExercises.indexOf(ex);
        this.savedSets[exIndex] = this.savedSets[exIndex] || 0;
        this.savedSets[exIndex] = this.setData[ex.exercise_id].filter((s: any) => s.completed).length;
      },
      error: (err) => {
        set.saving = false;
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        alert('Error al guardar la serie: ' + message);
      }
    });
  }

  completeWorkout(): void {
    this.finishing = true;
    const started = this.session ? new Date(this.session.created_at).getTime() : Date.now();
    const duration = Math.max(1, Math.round((Date.now() - started) / 60000));
    this.routineService.updateSession(this.session!.id, {
      status: 'completed',
      duration_minutes: duration
    }).subscribe({
      next: () => {
        this.finishing = false;
        alert('🏆 ¡Entrenamiento completado! Sigue así.');
        this.sessionMode = false;
        this.session = null;
        this.loadRoutine();
      },
      error: (err) => {
        this.finishing = false;
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        alert('Error al completar: ' + message);
      }
    });
  }
}
