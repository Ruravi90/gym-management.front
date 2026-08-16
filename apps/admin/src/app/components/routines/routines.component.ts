import { Component, OnInit } from '@angular/core';
import {
  RoutineService, ExerciseService, ClientService,
  Routine, Exercise, Client, MUSCLE_GROUPS, DAYS_OF_WEEK
} from '@shared';

@Component({
  selector: 'app-routines',
  templateUrl: './routines.component.html',
  styleUrls: ['./routines.component.css']
})
export class RoutinesComponent implements OnInit {
  routines: Routine[] = [];
  clients: Client[] = [];
  exercises: Exercise[] = [];
  loading = true;

  filterClientId = '';
  searchTerm = '';
  muscleGroups = MUSCLE_GROUPS;
  daysOfWeek = DAYS_OF_WEEK;

  showModal = false;
  editing: Routine | null = null;
  form: any = {
    name: '',
    description: '',
    client_id: null,
    is_active: true,
    days: []
  };

  // Datos del ejercicio que se está agregando a un día
  exercisePicker: any = {
    dayIndex: -1,
    exercise_id: null,
    sets: 3,
    reps: '10',
    weight: '',
    rest_seconds: 60,
    notes: ''
  };

  constructor(
    private routineService: RoutineService,
    private exerciseService: ExerciseService,
    private clientService: ClientService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error loading clients:', err)
    });
  }

  loadData(): void {
    this.loading = true;
    const clientId = this.filterClientId ? Number(this.filterClientId) : undefined;
    this.routineService.getAllRoutines(clientId, this.searchTerm || undefined).subscribe({
      next: (data) => {
        this.routines = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading routines:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.filterClientId = '';
    this.searchTerm = '';
    this.loadData();
  }

  clientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : `Cliente #${clientId}`;
  }

  // ---------- Modal ----------
  openNewModal(): void {
    this.editing = null;
    this.form = {
      name: '',
      description: '',
      client_id: this.filterClientId || null,
      is_active: true,
      days: []
    };
    this.exercisePicker.dayIndex = -1;
    this.showModal = true;
    this.ensureExercisesLoaded();
  }

  openEditModal(routine: Routine): void {
    this.editing = routine;
    this.form = {
      name: routine.name,
      description: routine.description || '',
      client_id: routine.client_id,
      is_active: routine.is_active,
      days: routine.days.map(d => ({
        name: d.name,
        day_of_week: d.day_of_week,
        order: d.order,
        exercises: d.exercises.map(e => ({
          exercise_id: e.exercise_id,
          exercise: e.exercise,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight || '',
          rest_seconds: e.rest_seconds,
          notes: e.notes || '',
          order: e.order
        }))
      }))
    };
    this.exercisePicker.dayIndex = -1;
    this.showModal = true;
    this.ensureExercisesLoaded();
  }

  closeModal(): void {
    this.showModal = false;
  }

  ensureExercisesLoaded(): void {
    if (this.exercises.length === 0) {
      this.exerciseService.getExercises().subscribe({
        next: (data) => this.exercises = data,
        error: (err) => console.error('Error loading exercises:', err)
      });
    }
  }

  // ---------- Días ----------
  addDay(): void {
    this.form.days.push({
      name: `Día ${this.form.days.length + 1}`,
      day_of_week: null,
      order: this.form.days.length,
      exercises: []
    });
  }

  removeDay(index: number): void {
    this.form.days.splice(index, 1);
  }

  // ---------- Ejercicios dentro de un día ----------
  openExercisePicker(dayIndex: number): void {
    this.exercisePicker = {
      dayIndex,
      exercise_id: null,
      sets: 3,
      reps: '10',
      weight: '',
      rest_seconds: 60,
      notes: ''
    };
  }

  addExerciseToDay(): void {
    const picker = this.exercisePicker;
    if (picker.dayIndex < 0 || !picker.exercise_id) {
      alert('Selecciona un ejercicio');
      return;
    }
    const day = this.form.days[picker.dayIndex];
    if (!day) { return; }
    const selected = this.exercises.find(e => e.id === Number(picker.exercise_id));
    day.exercises.push({
      exercise_id: Number(picker.exercise_id),
      exercise: selected,
      sets: Number(picker.sets) || 3,
      reps: picker.reps || '10',
      weight: picker.weight,
      rest_seconds: Number(picker.rest_seconds) || 60,
      notes: picker.notes,
      order: day.exercises.length
    });
    this.exercisePicker.dayIndex = -1;
  }

  removeExerciseFromDay(dayIndex: number, exerciseIndex: number): void {
    this.form.days[dayIndex].exercises.splice(exerciseIndex, 1);
  }

  exerciseName(id: number): string {
    const found = this.exercises.find(e => e.id === id) || this.form.days
      .flatMap((d: any) => d.exercises)
      .find((e: any) => e.exercise_id === id && e.exercise);
    return found && found.name ? found.name : (found && found.exercise ? found.exercise.name : `#${id}`);
  }

  // ---------- Guardar / eliminar ----------
  save(): void {
    if (!this.form.name) {
      alert('El nombre de la rutina es obligatorio');
      return;
    }
    if (!this.form.client_id) {
      alert('Selecciona el cliente al que se asignará la rutina');
      return;
    }
    const payload: any = {
      name: this.form.name,
      description: this.form.description || null,
      client_id: Number(this.form.client_id),
      is_active: this.form.is_active,
      days: this.form.days.map((d: any) => ({
        name: d.name,
        day_of_week: d.day_of_week !== null && d.day_of_week !== '' ? Number(d.day_of_week) : null,
        order: d.order,
        exercises: d.exercises.map((e: any) => ({
          exercise_id: e.exercise_id,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight || null,
          rest_seconds: e.rest_seconds,
          notes: e.notes || null,
          order: e.order
        }))
      }))
    };

    if (this.editing) {
      this.routineService.updateRoutine(this.editing.id, payload).subscribe({
        next: () => { this.closeModal(); this.loadData(); },
        error: (err) => this.showError(err)
      });
    } else {
      this.routineService.createRoutine(payload).subscribe({
        next: () => { this.closeModal(); this.loadData(); },
        error: (err) => this.showError(err)
      });
    }
  }

  deleteRoutine(routine: Routine): void {
    if (confirm(`¿Eliminar la rutina "${routine.name}"?`)) {
      this.routineService.deleteRoutine(routine.id).subscribe({
        next: () => this.loadData(),
        error: (err) => this.showError(err)
      });
    }
  }

  toggleActive(routine: Routine): void {
    this.routineService.updateRoutine(routine.id, { is_active: !routine.is_active }).subscribe({
      next: () => this.loadData(),
      error: (err) => this.showError(err)
    });
  }

  dayName(dayOfWeek: number | null | undefined): string {
    if (dayOfWeek === null || dayOfWeek === undefined) { return 'Flexible'; }
    return this.daysOfWeek[dayOfWeek] || 'Flexible';
  }

  muscleLabel(value: string): string {
    const found = this.muscleGroups.find(m => m.value === value);
    return found ? found.label : (value || '');
  }

  private showError(err: any): void {
    const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error de servidor');
    alert('Error: ' + message);
  }
}
