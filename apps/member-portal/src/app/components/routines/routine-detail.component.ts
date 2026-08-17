import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutineService, Routine, WorkoutSession, RoutineDay } from '@shared';

@Component({
  selector: 'app-routine-detail',
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="back-row">
          <button (click)="goBack()" class="btn btn-ghost btn-sm">← Volver</button>
        </div>
        <h1>{{ routine?.name }}</h1>
        <p *ngIf="routine?.description">{{ routine.description }}</p>
        <div class="day-tabs" *ngIf="routine && routine.days.length > 1 && !sessionMode">
          <button *ngFor="let day of routine.days; let i = index" class="day-tab"
            [class.active]="selectedDayIndex === i" (click)="selectDay(i)">
            {{ day.name }}
          </button>
        </div>
      </header>

      <div *ngIf="loading" class="loading">Cargando rutina...</div>

      <ng-container *ngIf="routine && !loading">
        <!-- ========== MODO BROWSE: Lista de ejercicios ========== -->
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

        <!-- ========== MODO ENTRENAMIENTO: Un ejercicio a la vez ========== -->
        <div *ngIf="sessionMode && session" class="workout-active">
          <!-- Header del workout -->
          <div class="workout-header">
            <div class="workout-header-top">
              <button class="btn btn-ghost btn-sm" (click)="confirmExit()">✕ Salir</button>
              <span class="exercise-progress">{{ currentExerciseIndex + 1 }} / {{ sessionExercises.length }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="progressPercent + '%'"></div>
            </div>
          </div>

          <!-- GIF del ejercicio actual -->
          <div class="gif-demo" *ngIf="currentExercise?.exercise?.gif_url" (click)="showGif(currentExercise.exercise.gif_url)">
            <img [src]="currentExercise.exercise.gif_url" [alt]="currentExercise.exercise?.name">
            <span class="gif-hint">Toca para ver grande</span>
          </div>
          <div class="gif-demo gif-placeholder" *ngIf="!currentExercise?.exercise?.gif_url">
            <span>🎥</span>
            <span class="gif-hint">Sin demostración</span>
          </div>

          <!-- Info del ejercicio -->
          <div class="card exercise-info-card">
            <h2 class="exercise-name">{{ currentExercise?.exercise?.name || ('#' + currentExercise?.exercise_id) }}</h2>
            <p class="exercise-prescription muted">
              {{ currentExercise?.sets }} series × {{ currentExercise?.reps }} reps
              <span *ngIf="currentExercise?.weight"> · {{ currentExercise?.weight }}</span>
            </p>
            <p class="exercise-rest muted" *ngIf="currentExercise?.rest_seconds">
              ⏱️ Descanso: {{ currentExercise.rest_seconds }}s entre series
            </p>
            <p *ngIf="currentExercise?.notes" class="notes">📝 {{ currentExercise.notes }}</p>
          </div>

          <!-- Tabla de series del ejercicio actual -->
          <div class="card sets-card">
            <div class="sets-header">
              <h3>Series</h3>
              <span class="sets-completed">{{ completedSetsCount }} / {{ currentSets.length }} completadas</span>
            </div>
            <div class="set-list">
              <div class="set-item" *ngFor="let set of currentSets; let si = index"
                   [class.completed]="set.completed" [class.current]="!set.completed && isCurrentSet(si)">
                <span class="set-num">{{ si + 1 }}</span>
                <div class="set-inputs">
                  <input type="number" min="0" class="app-input set-input-reps"
                    [(ngModel)]="set.reps" placeholder="Reps"
                    (ngModelChange)="onRepsChange(set)">
                  <span class="set-input-label">reps</span>
                </div>
                <div class="set-inputs">
                  <input type="text" class="app-input set-input-weight"
                    [(ngModel)]="set.weight" placeholder="0">
                  <span class="set-input-label">kg</span>
                </div>
                <span class="set-check-icon">{{ set.completed ? '✓' : '' }}</span>
              </div>
            </div>
            <button class="btn btn-outline btn-block mt-2" (click)="saveAllSets()" [disabled]="savingSets">
              {{ savingSets ? 'Guardando...' : '💾 Guardar series' }}
            </button>
            <div class="saved-msg" *ngIf="lastSaveMsg">{{ lastSaveMsg }}</div>
          </div>

          <!-- Navegación entre ejercicios -->
          <div class="exercise-nav">
            <button class="btn btn-outline" (click)="prevExercise()" [disabled]="currentExerciseIndex === 0">
              ← Anterior
            </button>
            <button class="btn btn-primary" (click)="nextExercise()">
              {{ currentExerciseIndex === sessionExercises.length - 1 ? '✔️ Terminar' : 'Siguiente →' }}
            </button>
          </div>
        </div>
      </ng-container>
    </div>

    <!-- ========== OVERLAY: Rest Timer ========== -->
    <div class="rest-overlay" *ngIf="restTimer" (click)="skipRest()">
      <div class="rest-card" (click)="$event.stopPropagation()">
        <p class="rest-label">⏱️ Descanso</p>
        <p class="rest-time">{{ restMinutes }}:{{ restSecondsStr }}</p>
        <div class="rest-progress">
          <div class="rest-progress-fill" [style.width]="restProgressPercent + '%'"></div>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="skipRest()">Saltar descanso →</button>
      </div>
    </div>

    <!-- ========== MODAL: GIF grande ========== -->
    <div class="modal-overlay" *ngIf="gifUrl" (click.self)="gifUrl = ''">
      <div class="gif-modal">
        <img [src]="gifUrl" alt="Demostración del ejercicio">
        <button class="btn btn-outline mt-2" (click)="gifUrl = ''">Cerrar</button>
      </div>
    </div>

    <!-- ========== MODAL: Confirmar salida ========== -->
    <div class="modal-overlay" *ngIf="showExitConfirm" (click.self)="showExitConfirm = false">
      <div class="modal exit-modal">
        <h3>¿Salir del entrenamiento?</h3>
        <p class="muted">Perderás el progreso no guardado de esta sesión.</p>
        <div class="exit-actions">
          <button class="btn btn-outline" (click)="showExitConfirm = false">Cancelar</button>
          <button class="btn btn-danger" (click)="forceExit()">Salir</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Day tabs (browse mode) ===== */
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

    /* ===== Browse mode ===== */
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
      width: 84px; height: 84px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--slate-100);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      border: 1px solid var(--app-border);
    }
    .ex-media img { width: 100%; height: 100%; object-fit: cover; }
    .ex-media-placeholder { font-size: 1.6rem; }
    .ex-info { flex: 1; min-width: 0; }
    .ex-info h3 { margin: 0 0 0.25rem; font-size: 1rem; }
    .notes { color: var(--lime-700); font-size: 0.85rem; margin: 0.3rem 0 0; }

    /* ===== Workout mode: header + progress ===== */
    .workout-active { padding-bottom: 2rem; }
    .workout-header { margin-bottom: 1rem; }
    .workout-header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .exercise-progress { font-weight: 700; font-size: 0.9rem; color: var(--text-muted); }
    .progress-bar {
      height: 6px;
      background: var(--slate-200);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--app-primary);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    /* ===== Workout mode: GIF demo ===== */
    .gif-demo {
      width: 100%;
      height: 280px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--slate-900);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      cursor: pointer;
      position: relative;
      border: 1px solid var(--app-border);
    }
    .gif-demo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .gif-placeholder {
      flex-direction: column;
      gap: 0.5rem;
    }
    .gif-placeholder span:first-child { font-size: 3rem; }
    .gif-hint {
      position: absolute;
      bottom: 0.5rem;
      right: 0.75rem;
      font-size: 0.7rem;
      color: rgba(255,255,255,0.6);
      background: rgba(0,0,0,0.4);
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }

    /* ===== Workout mode: exercise info ===== */
    .exercise-info-card { margin-bottom: 0.75rem; }
    .exercise-name { margin: 0 0 0.3rem; font-size: 1.3rem; }
    .exercise-prescription { margin: 0 0 0.2rem; font-size: 0.95rem; }
    .exercise-rest { margin: 0; font-size: 0.85rem; }

    /* ===== Workout mode: sets ===== */
    .sets-card { margin-bottom: 1rem; }
    .sets-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .sets-header h3 { margin: 0; font-size: 1rem; }
    .sets-completed { font-size: 0.82rem; color: var(--success); font-weight: 600; }
    .set-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .set-item {
      display: grid;
      grid-template-columns: 40px 1fr 80px 32px;
      gap: 0.6rem;
      align-items: center;
      padding: 0.6rem 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--app-border);
      background: var(--app-surface);
      transition: all 0.15s;
    }
    .set-item.completed {
      background: var(--success-bg, #ecfdf5);
      border-color: var(--success, #22c55e);
    }
    .set-item.current {
      border-color: var(--app-primary);
      box-shadow: 0 0 0 2px rgba(132, 204, 22, 0.15);
    }
    .set-num {
      font-weight: 800;
      font-size: 1rem;
      color: var(--text-muted);
      text-align: center;
    }
    .set-item.completed .set-num { color: var(--success); }
    .set-inputs { display: flex; align-items: center; gap: 0.35rem; }
    .set-input-reps { width: 100%; }
    .set-input-weight { width: 100%; }
    .set-input-label { font-size: 0.72rem; color: var(--text-muted); min-width: 28px; }
    .set-check-icon {
      text-align: center;
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--success);
    }
    .saved-msg { color: var(--success); font-size: 0.82rem; margin-top: 0.75rem; font-weight: 600; text-align: center; }

    /* ===== Workout mode: navigation ===== */
    .exercise-nav {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .exercise-nav .btn { flex: 1; }

    /* ===== Rest timer overlay ===== */
    .rest-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    .rest-card {
      background: var(--app-surface);
      border-radius: var(--radius-xl);
      padding: 2.5rem 3rem;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      min-width: 260px;
    }
    .rest-label { margin: 0 0 0.5rem; font-size: 0.9rem; color: var(--text-muted); font-weight: 600; }
    .rest-time {
      margin: 0 0 1rem;
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--app-primary);
      font-variant-numeric: tabular-nums;
    }
    .rest-progress {
      height: 6px;
      background: var(--slate-200);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 1.25rem;
    }
    .rest-progress-fill {
      height: 100%;
      background: var(--app-primary);
      border-radius: 999px;
      transition: width 1s linear;
    }

    /* ===== GIF modal ===== */
    .gif-modal { text-align: center; }
    .gif-modal img {
      max-width: 92vw;
      max-height: 72vh;
      border-radius: var(--radius-lg);
      background: var(--slate-900);
      box-shadow: var(--shadow-lg);
    }

    /* ===== Exit confirm modal ===== */
    .exit-modal { text-align: center; max-width: 340px; }
    .exit-modal h3 { margin: 0 0 0.5rem; }
    .exit-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
    .exit-actions .btn { flex: 1; }

    /* ===== Animations ===== */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ===== Responsive ===== */
    @media (max-width: 560px) {
      .exercise-row { flex-wrap: wrap; }
      .ex-media { width: 64px; height: 64px; }
      .gif-demo { height: 220px; }
      .set-item { grid-template-columns: 32px 1fr 70px 28px; gap: 0.4rem; padding: 0.5rem; }
      .rest-card { padding: 2rem 2rem; min-width: 220px; }
      .rest-time { font-size: 2.8rem; }
    }
  `]
})
export class RoutineDetailComponent implements OnInit, OnDestroy {
  routine: Routine | null = null;
  loading = true;
  selectedDayIndex = 0;
  gifUrl = '';
  showExitConfirm = false;

  sessionMode = false;
  session: WorkoutSession | null = null;
  sessionExercises: any[] = [];
  currentExerciseIndex = 0;
  setData: any = {};
  savingSets = false;
  lastSaveMsg = '';
  finishing = false;

  restTimer: any = null;
  restRemaining = 0;
  restTotal = 0;

  private routineId = 0;
  private restInterval: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private routineService: RoutineService
  ) { }

  ngOnInit(): void {
    this.routineId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRoutine();
  }

  ngOnDestroy(): void {
    this.clearRestTimer();
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

  get currentExercise(): any {
    return this.sessionExercises[this.currentExerciseIndex] || null;
  }

  get currentSets(): any[] {
    if (!this.currentExercise) { return []; }
    return this.setData[this.currentExercise.exercise_id] || [];
  }

  get completedSetsCount(): number {
    return this.currentSets.filter(s => s.completed).length;
  }

  get progressPercent(): number {
    if (this.sessionExercises.length === 0) { return 0; }
    return ((this.currentExerciseIndex + 1) / this.sessionExercises.length) * 100;
  }

  get restMinutes(): number {
    return Math.floor(this.restRemaining / 60);
  }

  get restSecondsStr(): string {
    return String(this.restRemaining % 60).padStart(2, '0');
  }

  get restProgressPercent(): number {
    if (this.restTotal === 0) { return 0; }
    return ((this.restTotal - this.restRemaining) / this.restTotal) * 100;
  }

  selectDay(index: number): void {
    this.selectedDayIndex = index;
  }

  showGif(url: string): void {
    if (url) { this.gifUrl = url; }
  }

  goBack(): void {
    if (this.sessionMode) {
      this.showExitConfirm = true;
      return;
    }
    this.router.navigate(['/rutinas']);
  }

  confirmExit(): void {
    this.showExitConfirm = true;
  }

  forceExit(): void {
    this.showExitConfirm = false;
    this.clearRestTimer();
    this.sessionMode = false;
    this.session = null;
  }

  // ========== Auto-complete: check al escribir reps ==========
  onRepsChange(set: any): void {
    set.completed = set.reps !== null && set.reps !== '' && Number(set.reps) > 0;
  }

  isCurrentSet(index: number): boolean {
    const firstIncomplete = this.currentSets.findIndex(s => !s.completed);
    return index === firstIncomplete;
  }

  // ========== Entrenamiento ==========
  startWorkout(): void {
    const day = this.currentDay;
    if (!day) { return; }
    this.routineService.createSession({ routine_id: this.routine!.id, day_id: day.id }).subscribe({
      next: (session) => {
        this.session = session;
        this.sessionMode = true;
        this.currentExerciseIndex = 0;
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
      reps: re.reps,
      weight: re.weight || '',
      rest_seconds: re.rest_seconds || 60,
      notes: re.notes || ''
    }));
    this.setData = {};
    this.sessionExercises.forEach(ex => {
      this.setData[ex.exercise_id] = [];
      for (let i = 0; i < ex.sets; i++) {
        this.setData[ex.exercise_id].push({
          reps: null, weight: '', completed: false, saving: false
        });
      }
    });
  }

  // ========== Guardar series ==========
  saveAllSets(): void {
    if (!this.currentExercise || !this.session) { return; }
    this.savingSets = true;
    this.lastSaveMsg = '';
    const sets = this.currentSets;
    let pending = sets.filter(s => (s.reps !== null && s.reps !== '' && Number(s.reps) > 0) && !s.saving);

    if (pending.length === 0) {
      this.savingSets = false;
      this.lastSaveMsg = 'No hay series con datos para guardar.';
      return;
    }

    let saved = 0;
    pending.forEach((set, i) => {
      set.saving = true;
      const payload = {
        exercise_id: this.currentExercise.exercise_id,
        set_number: sets.indexOf(set) + 1,
        reps: Number(set.reps),
        weight: set.weight || null,
        completed: true
      };
      this.routineService.addSetLog(this.session.id, payload).subscribe({
        next: () => {
          set.saving = false;
          saved++;
          if (saved === pending.length) {
            this.savingSets = false;
            this.lastSaveMsg = `✅ ${saved} serie(s) guardada(s)`;
            const hasIncomplete = this.currentSets.some(s => !s.completed);
            if (hasIncomplete) { this.startRestTimer(); }
          }
        },
        error: (err) => {
          set.saving = false;
          saved++;
          if (saved === pending.length) {
            this.savingSets = false;
            this.lastSaveMsg = `⚠️ Algunas series no se guardaron`;
          }
        }
      });
    });
  }

  // ========== Navegación entre ejercicios ==========
  nextExercise(): void {
    if (this.currentExerciseIndex < this.sessionExercises.length - 1) {
      this.saveAllSets();
      this.currentExerciseIndex++;
      this.lastSaveMsg = '';
    } else {
      this.completeWorkout();
    }
  }

  prevExercise(): void {
    if (this.currentExerciseIndex > 0) {
      this.saveAllSets();
      this.currentExerciseIndex--;
      this.lastSaveMsg = '';
    }
  }

  // ========== Rest Timer ==========
  startRestTimer(): void {
    if (!this.currentExercise?.rest_seconds || this.currentExercise.rest_seconds <= 0) { return; }
    this.clearRestTimer();
    this.restTotal = this.currentExercise.rest_seconds;
    this.restRemaining = this.restTotal;
    this.restInterval = setInterval(() => {
      this.restRemaining--;
      if (this.restRemaining <= 0) {
        this.clearRestTimer();
      }
    }, 1000);
  }

  skipRest(): void {
    this.clearRestTimer();
  }

  private clearRestTimer(): void {
    if (this.restInterval) {
      clearInterval(this.restInterval);
      this.restInterval = null;
    }
    this.restRemaining = 0;
    this.restTotal = 0;
  }

  // ========== Completar entrenamiento ==========
  completeWorkout(): void {
    this.saveAllSets();
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
