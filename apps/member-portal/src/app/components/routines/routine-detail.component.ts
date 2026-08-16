import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutineService, Routine, WorkoutSession, RoutineDay } from '@shared';

@Component({
  selector: 'app-routine-detail',
  template: `
    <div class="container">
      <header class="header">
        <div class="back-row">
          <button (click)="goBack()" class="btn-back">⬅️ Volver a Mis Rutinas</button>
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
          <div class="day-card" *ngIf="currentDay">
            <h2>{{ currentDay.name }} <span class="muted">{{ dayLabel }}</span></h2>
            <div class="exercise-list">
              <div class="exercise-row" *ngFor="let re of currentDay.exercises; let i = index">
                <div class="ex-media" (click)="showGif(re.exercise?.gif_url || '')">
                  <img *ngIf="re.exercise?.gif_url" [src]="re.exercise.gif_url" [alt]="re.exercise?.name" loading="lazy">
                  <span *ngIf="!re.exercise?.gif_url">🎥</span>
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
                <button class="btn-gif" (click)="showGif(re.exercise?.gif_url || '')" *ngIf="re.exercise?.gif_url">Ver GIF</button>
              </div>
            </div>
            <button class="btn-start" (click)="startWorkout()" *ngIf="currentDay.exercises.length > 0">
              ▶️ Empezar entrenamiento
            </button>
          </div>
          <div class="empty" *ngIf="!currentDay">
            <p>Esta rutina aún no tiene días con ejercicios.</p>
          </div>
        </div>

        <!-- Modo entrenamiento: registrar series -->
        <div *ngIf="sessionMode && session">
          <div class="session-header">
            <h2>🏋️ Entrenando: {{ currentDay?.name || 'Sesión libre' }}</h2>
            <p class="muted">{{ session.date | date:'fullDate' }}</p>
          </div>

          <div class="exercise-block" *ngFor="let ex of sessionExercises; let ei = index">
            <h3>{{ ex.exercise?.name || ('#' + ex.exercise_id) }}
              <span class="muted">({{ ex.sets }} × {{ ex.reps }})</span>
            </h3>
            <div class="set-table">
              <div class="set-row set-head">
                <span>Serie</span><span>Reps</span><span>Peso</span><span>Hecha</span><span></span>
              </div>
              <div class="set-row" *ngFor="let set of getSetsFor(ex); let si = index">
                <span>{{ si + 1 }}</span>
                <input type="number" min="0" class="input" [(ngModel)]="set.reps" placeholder="Reps">
                <input type="text" class="input" [(ngModel)]="set.weight" placeholder="Peso">
                <input type="checkbox" [(ngModel)]="set.completed">
                <button class="btn-save" (click)="saveSet(ex, si)" [disabled]="set.saving">💾</button>
              </div>
            </div>
            <div class="saved" *ngIf="savedSets[ei]">✅ {{ savedSets[ei] }} series guardadas</div>
          </div>

          <button class="btn-finish" (click)="completeWorkout()" [disabled]="finishing">
            {{ finishing ? 'Guardando...' : '✔️ Terminar entrenamiento' }}
          </button>
        </div>
      </ng-container>
    </div>

    <!-- Modal GIF -->
    <div class="modal-overlay" *ngIf="gifUrl" (click.self)="gifUrl = ''">
      <div class="gif-modal">
        <img [src]="gifUrl" alt="Demostración del ejercicio">
        <button class="btn-back" (click)="gifUrl = ''">Cerrar</button>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 1rem; max-width: 900px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #eee; min-height: 100vh; }
    .header { background: rgba(18,18,18,0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .header h1 { margin: 0; font-size: 1.8rem; background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header p { color: #aaa; margin: 0.5rem 0 0; }
    .back-row { margin-bottom: 1rem; }
    .btn-back { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.6rem 1.2rem; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; }
    .day-tabs { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .day-tab { background: rgba(255,255,255,0.05); color: #aaa; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 14px; cursor: pointer; font-size: 0.85rem; }
    .day-tab.active { background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; font-weight: 700; border: none; }
    .loading { text-align: center; color: #aaa; padding: 3rem; }
    .day-card { background: rgba(18,18,18,0.7); border-radius: 20px; padding: 1.25rem; border: 1px solid rgba(255,255,255,0.05); }
    .muted { color: #888; font-size: 0.85rem; }
    .exercise-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
    .exercise-row { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 0.75rem; }
    .ex-media { width: 90px; height: 90px; border-radius: 12px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .ex-media img { width: 100%; height: 100%; object-fit: cover; }
    .ex-info { flex: 1; }
    .ex-info h3 { margin: 0 0 0.25rem; color: #fff; font-size: 1rem; }
    .notes { color: #f9d423; font-size: 0.85rem; margin: 0.3rem 0 0; }
    .btn-gif { background: rgba(249,212,35,0.12); color: #f9d423; border: none; padding: 0.5rem 1rem; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 0.8rem; white-space: nowrap; }
    .btn-start { width: 100%; margin-top: 1.25rem; background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; border: none; padding: 0.9rem; border-radius: 16px; font-weight: 800; cursor: pointer; font-size: 1rem; }
    .empty { text-align: center; color: #888; padding: 3rem; }
    .session-header { margin-bottom: 1rem; }
    .session-header h2 { color: #fff; margin: 0 0 0.25rem; }
    .exercise-block { background: rgba(18,18,18,0.7); border-radius: 16px; padding: 1rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.05); }
    .exercise-block h3 { color: #fff; margin: 0 0 0.75rem; font-size: 1rem; }
    .set-table { display: flex; flex-direction: column; gap: 0.4rem; }
    .set-row { display: grid; grid-template-columns: 60px 1fr 1fr 60px 44px; gap: 0.5rem; align-items: center; }
    .set-head { font-size: 0.75rem; color: #888; text-transform: uppercase; }
    .input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #eee; padding: 0.45rem 0.6rem; font-size: 0.9rem; outline: none; width: 100%; }
    .btn-save { background: rgba(249,212,35,0.15); color: #f9d423; border: none; border-radius: 8px; cursor: pointer; padding: 0.4rem; }
    .btn-save:disabled { opacity: 0.5; }
    .saved { color: #4ade80; font-size: 0.8rem; margin-top: 0.5rem; }
    .btn-finish { width: 100%; background: #4ade80; color: #000; border: none; padding: 0.9rem; border-radius: 16px; font-weight: 800; cursor: pointer; font-size: 1rem; margin-top: 0.5rem; }
    .btn-finish:disabled { opacity: 0.5; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
    .gif-modal { text-align: center; }
    .gif-modal img { max-width: 90vw; max-height: 75vh; border-radius: 16px; }
    .gif-modal .btn-back { margin-top: 1rem; }
    @media (min-width: 768px) { .container { padding: 2rem; } }
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
