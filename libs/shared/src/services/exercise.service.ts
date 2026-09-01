import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient) { }

  getExercises(search?: string, muscleGroup?: string, equipment?: string, trainingType?: string, difficulty?: string): Observable<Exercise[]> {
    let params = new HttpParams();
    if (search) { params = params.set('search', search); }
    if (muscleGroup) { params = params.set('muscle_group', muscleGroup); }
    if (equipment) { params = params.set('equipment', equipment); }
    if (trainingType) { params = params.set('training_type', trainingType); }
    if (difficulty) { params = params.set('difficulty', difficulty); }
    return this.http.get<Exercise[]>(this.apiUrl, { params });
  }

  getExercise(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  createExercise(exercise: Partial<Exercise>): Observable<Exercise> {
    return this.http.post<Exercise>(this.apiUrl, exercise);
  }

  updateExercise(id: number, exercise: Partial<Exercise>): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, exercise);
  }

  deleteExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
