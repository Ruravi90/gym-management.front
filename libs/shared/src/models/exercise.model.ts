export interface Exercise {
  id: number;
  name: string;
  description?: string;
  muscle_group?: string;
  body_part?: string;
  equipment?: string;
  difficulty?: string;
  target?: string;
  secondary_muscles?: string;
  instructions?: string;
  gif_url?: string;
  gif_urls?: string[];
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id?: number;
  day_id?: number;
  exercise_id: number;
  exercise?: Exercise;
  sets: number;
  reps: string;
  weight?: string;
  rest_seconds: number;
  notes?: string;
  order: number;
}

export interface RoutineDay {
  id?: number;
  routine_id?: number;
  name: string;
  day_of_week?: number;
  order: number;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: number;
  client_id: number;
  created_by?: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  days: RoutineDay[];
}

export interface SetLog {
  id?: number;
  session_id?: number;
  exercise_id: number;
  exercise?: Exercise;
  set_number: number;
  reps?: number;
  weight?: string;
  completed: boolean;
}

export interface WorkoutSession {
  id: number;
  client_id: number;
  routine_id?: number;
  day_id?: number;
  date: string;
  notes?: string;
  status: 'in_progress' | 'completed';
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
  set_logs: SetLog[];
}

export const MUSCLE_GROUPS: { value: string; label: string }[] = [
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'upper arms', label: 'Brazos' },
  { value: 'upper legs', label: 'Piernas' },
  { value: 'lower legs', label: 'Pantorrillas' },
  { value: 'waist', label: 'Core / Abdomen' },
  { value: 'cardio', label: 'Cardio' }
];

export const DAYS_OF_WEEK: string[] = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];
