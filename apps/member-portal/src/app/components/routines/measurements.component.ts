import { Component, OnInit } from '@angular/core';
import { MeasurementService, MentorService, BodyMeasurement, MEASUREMENT_FIELDS } from '@shared';

@Component({
  selector: 'app-measurements',
  template: `
    <div class="container">
      <header class="header">
        <div class="back-row">
          <button routerLink="/rutinas" class="btn-back">⬅️ Volver a Mis Rutinas</button>
        </div>
        <h1>📏 Mis Medidas</h1>
        <p>Registra tus medidas cada semana para ver tu progreso real. FitMentor las usará para darte mejores recomendaciones.</p>
      </header>

      <div class="grid">
        <!-- Formulario semanal -->
        <section class="card form-card">
          <h2>Registrar medidas de esta semana</h2>
          <label>Fecha
            <input type="date" class="input" [(ngModel)]="form.date" [max]="today">
          </label>
          <div class="fields">
            <label *ngFor="let f of fields">
              {{ f.label }} ({{ f.unit }})
              <input type="number" step="0.1" min="0" class="input" [(ngModel)]="form[f.field]" placeholder="—">
            </label>
          </div>
          <label>Notas (opcional)
            <input type="text" class="input" [(ngModel)]="form.notes" placeholder="Ej. tomadas en ayunas">
          </label>
          <button class="btn-save" (click)="save()" [disabled]="saving">
            {{ saving ? 'Guardando...' : '💾 Guardar medidas' }}
          </button>
          <p class="hint">💡 Si ya registraste medidas esta fecha, se actualizarán.</p>
        </section>

        <!-- Historial -->
        <section class="card history-card">
          <h2>Historial</h2>
          <div *ngIf="measurements.length === 0" class="empty">
            <p>Aún no tienes medidas registradas.</p>
            <p class="muted">¡Registra tu primera semana para empezar a ver tu progreso!</p>
          </div>
          <div class="table-wrap" *ngIf="measurements.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th *ngFor="let f of fields">{{ f.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of measurements; let i = index">
                  <td class="date-cell">
                    {{ m.date | date:'dd MMM' }}
                    <button class="del" (click)="remove(m)" title="Eliminar">✕</button>
                  </td>
                  <td *ngFor="let f of fields" [class.is-latest]="i === 0">
                    <ng-container *ngIf="cellValue(m, f) !== null">
                      {{ cellValue(m, f) }} {{ f.unit }}
                      <span *ngIf="deltaValue(m, f) !== null"
                        class="delta" [class.good]="isGoodDelta(f, deltaValue(m, f)!)" [class.bad]="!isGoodDelta(f, deltaValue(m, f)!)">
                        {{ deltaValue(m, f)! > 0 ? '▲' : (deltaValue(m, f)! < 0 ? '▼' : '•') }} {{ deltaValue(m, f) }}
                      </span>
                    </ng-container>
                    <span *ngIf="cellValue(m, f) === null">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Reporte semanal IA -->
      <section class="card report-card">
        <div class="report-header">
          <div>
            <h2>🤖 Reporte semanal con FitMentor</h2>
            <p class="muted">FitMentor analiza tus medidas, tu rutina y tus sesiones de la semana para darte recomendaciones.</p>
          </div>
          <button class="btn-report" (click)="generateReport()" [disabled]="reportLoading">
            {{ reportLoading ? 'Analizando...' : '📅 Generar mi reporte semanal' }}
          </button>
        </div>
        <div class="report" *ngIf="report">
          <pre>{{ report }}</pre>
        </div>
        <div class="report hint-report" *ngIf="!report && !reportLoading">
          Necesitas al menos una medición para generar el reporte. El reporte compara semana a semana.
        </div>
      </section>
    </div>
  `,
  styles: [`
    .container { padding: 1rem; max-width: 1100px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #eee; min-height: 100vh; }
    .header { text-align: center; background: rgba(18,18,18,0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 2rem 1.5rem; margin-bottom: 1.5rem; }
    .header h1 { font-size: 2rem; margin: 0 0 0.5rem; background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header p { color: #aaa; max-width: 620px; margin: 0 auto; }
    .back-row { text-align: left; margin-bottom: 1rem; }
    .btn-back { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.6rem 1.2rem; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
    @media (min-width: 900px) { .grid { grid-template-columns: 340px 1fr; } }
    .card { background: rgba(18,18,18,0.7); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 1.25rem; }
    .card h2 { color: #fff; margin-top: 0; font-size: 1.15rem; }
    .card label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; color: #bbb; margin-bottom: 0.75rem; }
    .input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #eee; padding: 0.6rem 0.9rem; font-size: 0.9rem; outline: none; width: 100%; box-sizing: border-box; }
    .input:focus { border-color: #f9d423; }
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .btn-save { width: 100%; background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; border: none; padding: 0.8rem; border-radius: 14px; font-weight: 800; cursor: pointer; font-size: 0.95rem; margin-top: 0.5rem; }
    .btn-save:disabled { opacity: 0.5; }
    .hint { color: #888; font-size: 0.8rem; margin: 0.6rem 0 0; }
    .empty { text-align: center; color: #aaa; padding: 2rem; }
    .muted { color: #888; font-size: 0.9rem; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { color: #aaa; text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600; white-space: nowrap; }
    td { padding: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.05); white-space: nowrap; }
    .date-cell { color: #f9d423; font-weight: 600; }
    .is-latest { color: #fff; font-weight: 600; }
    .delta { font-size: 0.75rem; margin-left: 0.3rem; }
    .delta.good { color: #4ade80; }
    .delta.bad { color: #f87171; }
    .del { background: rgba(255,78,80,0.15); color: #ff6b6b; border: none; border-radius: 6px; cursor: pointer; margin-left: 0.5rem; padding: 0.1rem 0.35rem; font-size: 0.7rem; }
    .report-card { margin-top: 1.25rem; }
    .report-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .report-header h2 { margin-bottom: 0.25rem; }
    .btn-report { background: #ff4e50; color: #fff; border: none; padding: 0.75rem 1.4rem; border-radius: 14px; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .btn-report:disabled { opacity: 0.5; }
    .report { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; margin-top: 1rem; }
    .report pre { white-space: pre-wrap; font-family: inherit; margin: 0; color: #ddd; line-height: 1.6; }
    .hint-report { color: #888; font-size: 0.85rem; margin-top: 1rem; }
  `]
})
export class MeasurementsComponent implements OnInit {
  fields = MEASUREMENT_FIELDS;
  measurements: BodyMeasurement[] = [];
  saving = false;
  reportLoading = false;
  report = '';
  today = new Date().toISOString().split('T')[0];

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

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.measurementService.getMeasurements(50).subscribe({
      next: (data) => this.measurements = data,
      error: (err) => console.error('Error loading measurements:', err)
    });
  }

  save(): void {
    if (!this.form.date) { alert('Selecciona una fecha'); return; }
    this.saving = true;
    const payload: any = { date: this.form.date, notes: this.form.notes || null };
    for (const f of this.fields) {
      const value = this.form[f.field];
      payload[f.field] = (value !== null && value !== undefined && value !== '') ? Number(value) : null;
    }
    this.measurementService.saveMeasurement(payload).subscribe({
      next: () => {
        this.saving = false;
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        alert('Error: ' + message);
      }
    });
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

  generateReport(): void {
    this.reportLoading = true;
    this.report = '';
    this.mentorService.weeklyCheckin().subscribe({
      next: (res) => {
        this.reportLoading = false;
        this.report = res.reply;
      },
      error: (err) => {
        this.reportLoading = false;
        const message = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        this.report = 'Lo siento, no se pudo generar el reporte: ' + message;
      }
    });
  }
}
