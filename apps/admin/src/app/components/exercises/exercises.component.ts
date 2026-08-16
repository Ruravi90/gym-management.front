import { Component, OnInit } from '@angular/core';
import { ExerciseService, Exercise, MUSCLE_GROUPS } from '@shared';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css']
})
export class ExercisesComponent implements OnInit {
  exercises: Exercise[] = [];
  loading = true;

  searchTerm = '';
  muscleGroup = '';
  muscleGroups = MUSCLE_GROUPS;

  showModal = false;
  editing: Exercise | null = null;
  form: any = {
    name: '',
    description: '',
    muscle_group: '',
    equipment: '',
    difficulty: 'beginner',
    target: '',
    secondary_muscles: '',
    instructions: '',
    gif_url: '',
    image_url: '',
    is_active: true
  };

  constructor(private exerciseService: ExerciseService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.exerciseService.getExercises(this.searchTerm || undefined, this.muscleGroup || undefined).subscribe({
      next: (data) => {
        this.exercises = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.muscleGroup = '';
    this.loadData();
  }

  openNewModal(): void {
    this.editing = null;
    this.form = {
      name: '',
      description: '',
      muscle_group: '',
      equipment: '',
      difficulty: 'beginner',
      target: '',
      secondary_muscles: '',
      instructions: '',
      gif_url: '',
      image_url: '',
      is_active: true
    };
    this.showModal = true;
  }

  openEditModal(exercise: Exercise): void {
    this.editing = exercise;
    this.form = {
      name: exercise.name,
      description: exercise.description || '',
      muscle_group: exercise.muscle_group || '',
      equipment: exercise.equipment || '',
      difficulty: exercise.difficulty || 'beginner',
      target: exercise.target || '',
      secondary_muscles: exercise.secondary_muscles || '',
      instructions: exercise.instructions || '',
      gif_url: exercise.gif_url || '',
      image_url: exercise.image_url || '',
      is_active: exercise.is_active
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    if (!this.form.name) {
      alert('El nombre del ejercicio es obligatorio');
      return;
    }
    const payload: Partial<Exercise> = {
      name: this.form.name,
      description: this.form.description || null,
      muscle_group: this.form.muscle_group || null,
      equipment: this.form.equipment || null,
      difficulty: this.form.difficulty || 'beginner',
      target: this.form.target || null,
      secondary_muscles: this.form.secondary_muscles || null,
      instructions: this.form.instructions || null,
      gif_url: this.form.gif_url || null,
      image_url: this.form.image_url || null,
      is_active: this.form.is_active
    };

    if (this.editing) {
      this.exerciseService.updateExercise(this.editing.id, payload).subscribe({
        next: () => { this.closeModal(); this.loadData(); },
        error: (err) => this.showError(err)
      });
    } else {
      this.exerciseService.createExercise(payload).subscribe({
        next: () => { this.closeModal(); this.loadData(); },
        error: (err) => this.showError(err)
      });
    }
  }

  deleteExercise(exercise: Exercise): void {
    if (confirm(`¿Eliminar el ejercicio "${exercise.name}"?`)) {
      this.exerciseService.deleteExercise(exercise.id).subscribe({
        next: () => this.loadData(),
        error: (err) => this.showError(err)
      });
    }
  }

  toggleActive(exercise: Exercise): void {
    this.exerciseService.updateExercise(exercise.id, { is_active: !exercise.is_active }).subscribe({
      next: () => this.loadData(),
      error: (err) => this.showError(err)
    });
  }

  onPreviewError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  private showError(err: any): void {
    const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error de servidor');
    alert('Error: ' + message);
  }

  muscleLabel(value: string): string {
    const found = this.muscleGroups.find(m => m.value === value);
    return found ? found.label : (value || '—');
  }
}
