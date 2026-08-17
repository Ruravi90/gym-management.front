import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MentorReply {
  reply: string;
  provider?: string;
}

export interface BodyTypeResult {
  body_type?: string | null;
  reply: string;
}

export interface RoutineGenerationResult {
  ok: boolean;
  ask_body_type?: boolean;
  reply: string;
  provider?: string;
  routine_id?: number;
  routine_name?: string;
}

export interface PhysicalProfile {
  body_type?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  sex?: string | null;
  daily_activity?: string | null;
  injuries?: string | null;
  bmi?: number | null;
}

export interface RoutineGenerationPayload extends PhysicalProfile {
  body_type: string;
  goal: string;
  days_per_week: number;
  equipment?: string;
  experience?: string;
  duration_minutes?: number;
}

export const BODY_TYPES: { value: string; label: string; description: string }[] = [
  {
    value: 'ectomorph',
    label: 'Ectomorfo',
    description: 'Complexión delgada, metabolismo rápido, te cuesta subir de peso. → Series pesadas, menos cardio.'
  },
  {
    value: 'mesomorph',
    label: 'Mesomorfo',
    description: 'Complexión atlética, ganas músculo con facilidad. → Equilibrio entre fuerza e hipertrofia.'
  },
  {
    value: 'endomorph',
    label: 'Endomorfo',
    description: 'Tendencia a acumular grasa, ganas peso fácil. → Definición, más cardio, descansos cortos.'
  }
];

export const TRAINING_GOALS: { value: string; label: string }[] = [
  { value: 'general', label: 'Mantenerme en forma' },
  { value: 'muscle_gain', label: 'Ganar masa muscular (hipertrofia)' },
  { value: 'fat_loss', label: 'Perder grasa / definir' },
  { value: 'strength', label: 'Ganar fuerza' },
  { value: 'endurance', label: 'Resistencia y condición física' }
];

export const TRAINING_EQUIPMENT: { value: string; label: string }[] = [
  { value: 'gimnasio', label: 'Gimnasio completo' },
  { value: 'casa', label: 'En casa (mancuernas y ligas)' },
  { value: 'calistenia', label: 'Solo peso corporal' },
  { value: 'barra', label: 'Solo barra (pesas libres)' }
];

export const TRAINING_EXPERIENCE: { value: string; label: string }[] = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
];

export const SEX_OPTIONS: { value: string; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' }
];

export const ACTIVITY_LEVELS: { value: string; label: string }[] = [
  { value: 'sedentario', label: 'Sedentario (poco movimiento en el día)' },
  { value: 'ligero', label: 'Ligero (caminas o estás de pie)' },
  { value: 'moderado', label: 'Moderado (trabajo activo o ejercicio ocasional)' },
  { value: 'activo', label: 'Activo (trabajo físico o entrenas seguido)' }
];

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private apiUrl = `${environment.apiUrl}/mentor`;

  constructor(private http: HttpClient) { }

  weeklyCheckin(): Observable<MentorReply> {
    return this.http.post<MentorReply>(`${this.apiUrl}/weekly-checkin`, {});
  }

  getBodyType(): Observable<BodyTypeResult> {
    return this.http.get<BodyTypeResult>(`${this.apiUrl}/body-type`);
  }

  saveBodyType(bodyType: string): Observable<BodyTypeResult> {
    return this.http.post<BodyTypeResult>(`${this.apiUrl}/body-type`, { body_type: bodyType });
  }

  getProfile(): Observable<PhysicalProfile> {
    return this.http.get<PhysicalProfile>(`${this.apiUrl}/profile`);
  }

  saveProfile(profile: Partial<PhysicalProfile>): Observable<PhysicalProfile> {
    return this.http.post<PhysicalProfile>(`${this.apiUrl}/profile`, profile);
  }

  generateRoutine(payload: RoutineGenerationPayload): Observable<RoutineGenerationResult> {
    return this.http.post<RoutineGenerationResult>(`${this.apiUrl}/generate-routine`, payload);
  }
}
