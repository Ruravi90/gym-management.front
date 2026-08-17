import { Component, OnInit } from '@angular/core';
import { KaizenService, KaizenHabit, KaizenMedal } from './kaizen.service';

@Component({
  selector: 'app-kaizen',
  template: `
    <div class="page-container kaizen-container">
      <header class="page-header">
        <div class="back-row">
          <button routerLink="/dashboard" class="btn btn-ghost btn-sm">← Volver al Dashboard</button>
        </div>
        <h1>Mejora Continua <span class="accent">Kaizen</span></h1>
        <p>Conviértete en un mejor guerrero cada día. Registra tus hábitos, reflexiona sobre tus metas y consigue medallas por tu esfuerzo.</p>
        <div class="header-actions">
          <button (click)="showTutorial = !showTutorial" class="btn btn-outline">
            {{ showTutorial ? 'Ocultar Tutorial' : '📖 ¿Cómo funciona esto?' }}
          </button>
        </div>
      </header>

      <div class="card tutorial-card" *ngIf="showTutorial">
        <h3>Bienvenido a tu panel de Mejora Continua (Kaizen)</h3>
        <p>Este módulo está diseñado para ayudarte a construir disciplina mediante el registro diario de tus hábitos. Así es como funciona:</p>
        <ul>
          <li><strong>+ Nuevo Hábito:</strong> Crea un hábito que deseas desarrollar (ej. "Beber agua", "Entrenar", "Leer 20 mins").</li>
          <li><strong>Editar / Eliminar:</strong> Haz clic en el lápiz junto al nombre de tu hábito para modificarlo (presiona Enter para guardar), o en la papelera para borrarlo por completo.</li>
          <li><strong>Círculos de los Días:</strong> Representan los días del mes actual.
            <br>• Haz un clic: Marca el día como <b class="text-success">Victoria (Verde)</b>. ¡Lo lograste!
            <br>• Haz otro clic: Marca el día como <b class="text-danger">Derrota (Rojo)</b>. No pasa nada, mañana lo harás mejor.
            <br>• Haz otro clic: Vuelve a dejarlo pendiente.</li>
          <li><strong>Reflexión y Meta:</strong> Escribe tus metas para el hábito y reflexiona sobre lo aprendido cada día. Se guarda automáticamente al hacer clic fuera de la caja.</li>
          <li><strong>🏆 Medallas:</strong> Al acumular días consecutivos de victoria, irás desbloqueando insignias (Diaria, Semanal, Mensual, Anual) que se mostrarán en la sección derecha.</li>
        </ul>

        <h4 class="tutorial-warn">⚠️ Sistema Estricto de Penalizaciones</h4>
        <p style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.95rem;">Kaizen no perdona la falta de constancia. Como verdadero guerrero, enfrentarás consecuencias si abandonas tus deberes:</p>
        <ul style="margin-top: 0; font-size: 0.95rem;">
          <li><strong class="text-danger">Pérdida de Medallas:</strong> Las medallas no son permanentes. Si registras 3 "Derrotas" consecutivas en un hábito, perderás tu medalla de Bronce. Si registras tan solo 1 "Derrota" hoy, perderás tu racha y tu medalla de Plata. Si tu éxito mensual baja del 50%, dirás adiós a tu medalla de Oro.</li>
          <li><strong class="text-warning">Cuello de Botella (Emparejamiento):</strong> El sistema no te permitirá avanzar únicamente en tus hábitos fáciles. Si la diferencia de victorias entre tu mejor hábito y tu hábito más olvidado es mayor a 3 días, <b>se bloqueará tu progreso</b>. Tendrás que retomar los hábitos olvidados antes de seguir sumando victorias en los demás.</li>
        </ul>
      </div>

      <div class="kaizen-content">
        <app-habit-tracker [habits]="habits" (logUpdate)="onLogUpdate()"></app-habit-tracker>
        <app-medals-showcase [medals]="medals"></app-medals-showcase>
      </div>
    </div>
  `,
  styles: [`
    .kaizen-container { max-width: 1400px; }
    .page-header h1 { font-size: 2rem; }
    .accent { color: var(--lime-600); }
    .header-actions { margin-top: 1.25rem; }

    .tutorial-card {
      margin-bottom: 2rem;
      border-color: var(--app-primary-soft-border);
      background: linear-gradient(135deg, var(--app-surface) 0%, var(--lime-50) 100%);
    }
    .tutorial-card h3 { color: var(--lime-700); margin-top: 0; font-size: 1.2rem; }
    .tutorial-card ul { line-height: 1.7; padding-left: 1.2rem; font-size: 0.95rem; }
    .tutorial-card li { margin-bottom: 0.7rem; }
    .tutorial-warn { color: var(--danger); margin: 1.5rem 0 0.5rem; }
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .text-warning { color: var(--warning); }

    .kaizen-content { display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start; }
    @media (min-width: 1024px) { .kaizen-content { grid-template-columns: 2fr 1fr; } }
  `]
})
export class KaizenComponent implements OnInit {
  habits: KaizenHabit[] = [];
  medals: KaizenMedal[] = [];
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  showTutorial = false;

  constructor(private kaizenService: KaizenService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.kaizenService.getHabits(this.currentMonth, this.currentYear).subscribe(res => this.habits = res);
    this.kaizenService.getMedals().subscribe(res => this.medals = res);
  }

  onLogUpdate() {
    this.loadData(); // Reload stats and medals if a log changes
  }
}
