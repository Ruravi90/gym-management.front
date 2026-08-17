import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MeasurementService, MentorService, BodyMeasurement, MEASUREMENT_FIELDS } from '@shared';

@Component({
  selector: 'app-measurements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="back-row" *ngIf="!hideBackButton">
          <button routerLink="/rutinas" class="btn btn-ghost btn-sm">← Volver a Mis Rutinas</button>
        </div>
        <h1>📏 Mis Medidas</h1>
        <p>Registra tus medidas cada semana para ver tu progreso real. FitMentor las usará para darte mejores recomendaciones.</p>
      </header>

      <div class="grid grid-measurements">
        <!-- Formulario semanal -->
        <section class="card form-card">
          <h2 class="card-title">Tu altura (una sola vez)</h2>
          <div class="altura-box">
            <label class="field" style="flex:1; margin-bottom: 0;">
              Altura
              <input type="number" step="0.1" min="80" max="250" class="app-input" [(ngModel)]="heightCm" placeholder="Ej. 175">
            </label>
            <button class="btn btn-outline" (click)="saveHeight()" [disabled]="savingHeight">
              {{ savingHeight ? 'Guardando...' : '💾 Guardar' }}
            </button>
          </div>
          <p class="hint" *ngIf="bmi">📊 Tu IMC actual: <strong>{{ bmi }}</strong> (altura + último peso)</p>

          <h2 class="card-title sec">Registrar medidas de esta semana</h2>
          <label class="field">Fecha
            <input type="date" class="app-input" [(ngModel)]="form.date" [max]="today">
          </label>
          <div class="fields">
            <label class="field" *ngFor="let f of fields">
              {{ f.label }} ({{ f.unit }})
              <input type="number" step="0.1" min="0" class="app-input" [(ngModel)]="form[f.field]" placeholder="—">
            </label>
          </div>
          <label class="field">Notas (opcional)
            <input type="text" class="app-input" [(ngModel)]="form.notes" placeholder="Ej. tomadas en ayunas">
          </label>
          <button class="btn btn-primary btn-lg btn-block" (click)="save()" [disabled]="saving">
            {{ saving ? 'Guardando...' : '💾 Guardar medidas' }}
          </button>
          <p class="hint">💡 Si ya registraste medidas esta fecha, se actualizarán.</p>
        </section>

        <!-- Historial -->
        <section class="card history-card">
          <div class="flex-between">
            <h2 class="card-title" style="margin:0;">Historial</h2>
            <span class="badge badge-primary" *ngIf="bmi">IMC: {{ bmi }}</span>
          </div>
          <div *ngIf="measurements.length === 0" class="empty-state">
            <p>Aún no tienes medidas registradas.</p>
            <p class="muted">¡Registra tu primera semana para empezar a ver tu progreso!</p>
          </div>
          <div class="measurement-cards mt-2" *ngIf="measurements.length > 0">
            <div class="measurement-card" *ngFor="let m of measurements; let i = index"
                 [class.is-latest]="i === 0">
              <div class="mc-header">
                <span class="mc-date">{{ m.date | date:'dd MMM, yyyy' }}</span>
                <button class="btn btn-danger btn-sm" (click)="remove(m)" title="Eliminar">✕</button>
              </div>
              <div class="mc-grid">
                <div class="mc-field" *ngFor="let f of fields">
                  <span class="mc-label">{{ f.label }}</span>
                  <ng-container *ngIf="cellValue(m, f) !== null">
                    <span class="mc-value">{{ cellValue(m, f) }} {{ f.unit }}</span>
                    <span *ngIf="deltaValue(m, f) !== null"
                          class="delta" [class.good]="isGoodDelta(f, deltaValue(m, f)!)"
                          [class.bad]="!isGoodDelta(f, deltaValue(m, f)!)">
                      {{ deltaValue(m, f)! > 0 ? '▲' : (deltaValue(m, f)! < 0 ? '▼' : '•') }}
                      {{ deltaValue(m, f) }}
                    </span>
                  </ng-container>
                  <span *ngIf="cellValue(m, f) === null" class="mc-empty">—</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .grid-measurements { grid-template-columns: 1fr; align-items: start; }
    @media (min-width: 900px) { .grid-measurements { grid-template-columns: 360px 1fr; } }
    .card-title { font-size: 1.15rem; font-weight: 800; }
    .card-title.sec {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--app-border);
    }
    .altura-box { display: flex; align-items: flex-end; gap: 0.6rem; }
    .hint { color: var(--text-muted); font-size: 0.82rem; margin: 0.7rem 0 0; }
    .fields { display: grid; grid-template-columns: 1fr; gap: 0; }
    @media (min-width: 520px) { .fields { grid-template-columns: 1fr 1fr; gap: 0 0.9rem; } }

    .measurement-cards { display: flex; flex-direction: column; gap: 0.75rem; }
    .measurement-card {
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      background: var(--app-surface);
    }
    .measurement-card.is-latest { border-left: 3px solid var(--app-primary); }
    .mc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .mc-date { font-weight: 700; color: var(--lime-700); font-size: 0.95rem; }
    .mc-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    @media (min-width: 700px) { .mc-grid { grid-template-columns: repeat(3, 1fr); } }
    .mc-field { display: flex; flex-direction: column; gap: 0.15rem; }
    .mc-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .mc-value { font-size: 0.95rem; font-weight: 700; color: var(--text-main); }
    .mc-empty { font-size: 0.85rem; color: var(--slate-400); }
    .delta { font-size: 0.75rem; font-weight: 700; }
    .delta.good { color: var(--success); }
    .delta.bad { color: var(--danger); }
  `]
})
export class MeasurementsComponent implements OnChanges {
  @Input() clientId?: number;
  @Input() hideBackButton = false;

  fields = MEASUREMENT_FIELDS;
  measurements: BodyMeasurement[] = [];
  saving = false;
  today = new Date().toISOString().split('T')[0];

  heightCm: number | null = null;
  savingHeight = false;
  bmi: number | null = null;

  form: any = {
    date: new Date().toISOString().split('T')[0],
    weight_kg: null,
    waist_cm: null,
    abdomen_low_cm: null,
    thigh_cm: null,
    arm_relaxed_cm: null,
    arm_flexed_cm: null,
    notes: ''
  };

  constructor(
    private measurementService: MeasurementService,
    private mentorService: MentorService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientId']) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.loadData();
    if (!this.clientId) {
      this.loadProfile();
    }
  }

  loadData(): void {
    this.measurementService.getMeasurements(50, this.clientId).subscribe({
      next: (data) => {
        this.measurements = data;
        this.computeBmi();
      },
      error: (err) => console.error('Error loading measurements:', err)
    });
  }

  loadProfile(): void {
    this.mentorService.getProfile().subscribe({
      next: (p) => {
        if (p.height_cm) { this.heightCm = p.height_cm; }
        this.computeBmi(p.weight_kg ?? undefined);
      },
      error: () => { }
    });
  }

  saveHeight(): void {
    const h = Number(this.heightCm);
    if (!h || h < 80 || h > 250) { alert('Ingresa una altura válida (80-250 cm)'); return; }
    this.savingHeight = true;
    this.mentorService.saveProfile({ height_cm: h }).subscribe({
      next: (p) => {
        this.savingHeight = false;
        this.computeBmi(p.weight_kg ?? undefined);
      },
      error: (err) => {
        this.savingHeight = false;
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        alert('Error: ' + message);
      }
    });
  }

  private latestWeight(): number | null {
    if (this.measurements.length > 0 && this.measurements[0].weight_kg != null) {
      const n = Number(this.measurements[0].weight_kg);
      return isNaN(n) ? null : n;
    }
    return null;
  }

  computeBmi(weight?: number | null): void {
    const w = weight ?? this.latestWeight();
    if (this.heightCm && w) {
      const m = this.heightCm / 100;
      this.bmi = Math.round((w / (m * m)) * 10) / 10;
    } else {
      this.bmi = null;
    }
  }

  save(): void {
    if (!this.form.date) { alert('Selecciona una fecha'); return; }
    this.saving = true;
    const payload: any = { date: this.form.date, notes: this.form.notes || null };
    for (const f of this.fields) {
      const value = this.form[f.field];
      payload[f.field] = (value !== null && value !== undefined && value !== '') ? Number(value) : null;
    }
    this.measurementService.saveMeasurement(payload, this.clientId).subscribe({
      next: () => {
        this.saving = false;
        this.loadData();
        this.resetForm();
      },
      error: (err) => {
        this.saving = false;
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        alert('Error: ' + message);
      }
    });
  }

  resetForm(): void {
    this.form = {
      date: new Date().toISOString().split('T')[0],
      weight_kg: null,
      waist_cm: null,
      abdomen_low_cm: null,
      thigh_cm: null,
      arm_relaxed_cm: null,
      arm_flexed_cm: null,
      notes: ''
    };
  }

  remove(m: BodyMeasurement): void {
    if (confirm(`¿Eliminar las medidas del ${m.date}?`)) {
      this.measurementService.deleteMeasurement(m.id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }

  cellValue(m: BodyMeasurement, f: any): number | null {
    const v = m[f.field];
    if (v === null || v === undefined || v === '') { return null; }
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  deltaValue(m: BodyMeasurement, f: any): number | null {
    const d = m[f.deltaField];
    if (d === null || d === undefined) { return null; }
    const n = Number(d);
    return isNaN(n) ? null : n;
  }

  isGoodDelta(f: any, delta: number): boolean {
    if (delta === 0) { return true; }
    return f.increaseIsGood ? delta > 0 : delta < 0;
  }
}
