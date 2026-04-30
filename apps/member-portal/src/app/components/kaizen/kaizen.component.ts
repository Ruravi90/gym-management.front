import { Component, OnInit } from '@angular/core';
import { KaizenService, KaizenHabit, KaizenMedal } from './kaizen.service';

@Component({
  selector: 'app-kaizen',
  template: `
    <div class="kaizen-container">
      <header class="kaizen-header">
        <div style="text-align: left; margin-bottom: 1rem;">
          <button routerLink="/dashboard" class="btn-back">⬅️ Volver al Dashboard</button>
        </div>
        <h1>Mejora Continua <span>Kaizen</span></h1>
        <p>Conviértete en un mejor guerrero cada día. Registra tus hábitos, reflexiona sobre tus metas y consigue medallas por tu esfuerzo.</p>
        <button (click)="showTutorial = !showTutorial" class="btn-tutorial">
          {{ showTutorial ? 'Ocultar Tutorial' : '📖 ¿Cómo funciona esto?' }}
        </button>
      </header>

      <div class="tutorial-card" *ngIf="showTutorial">
        <h3>Bienvenido a tu panel de Mejora Continua (Kaizen)</h3>
        <p>Este módulo está diseñado para ayudarte a construir disciplina mediante el registro diario de tus hábitos. Así es como funciona:</p>
        <ul>
          <li><span class="icon">+ Nuevo Hábito:</span> Crea un hábito que deseas desarrollar (ej. "Beber agua", "Entrenar", "Leer 20 mins").</li>
          <li><span class="icon">✏️ Editar / 🗑️ Eliminar:</span> Haz clic en el lápiz junto al nombre de tu hábito para modificarlo (presiona Enter para guardar), o en la papelera para borrarlo por completo.</li>
          <li><span class="icon">Círculos de los Días:</span> Representan los días del mes actual. 
            <br>• Haz un clic: Marca el día como <b>Victoria (Verde)</b>. ¡Lo lograste!
            <br>• Haz otro clic: Marca el día como <b>Derrota (Rojo)</b>. No pasa nada, mañana lo harás mejor.
            <br>• Haz otro clic: Vuelve a dejarlo pendiente.</li>
          <li><span class="icon">Reflexión y Meta:</span> Escribe tus metas para el hábito y reflexiona sobre lo aprendido cada día. Se guarda automáticamente al hacer clic fuera de la caja.</li>
          <li><span class="icon">🏆 Medallas:</span> Al acumular días consecutivos de victoria, irás desbloqueando insignias (Diaria, Semanal, Mensual, Anual) que se mostrarán en la sección derecha.</li>
        </ul>
        
        <h4 style="color: #ff4e50; margin-top: 1.5rem; margin-bottom: 0.5rem;">⚠️ Sistema Estricto de Penalizaciones</h4>
        <p style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.95rem;">Kaizen no perdona la falta de constancia. Como verdadero guerrero, enfrentarás consecuencias si abandonas tus deberes:</p>
        <ul style="margin-top: 0; font-size: 0.95rem;">
          <li><span class="icon" style="color:#ff4e50;">Pérdida de Medallas:</span> Las medallas no son permanentes. Si registras 3 "Derrotas" consecutivas en un hábito, perderás tu medalla de Bronce. Si registras tan solo 1 "Derrota" hoy, perderás tu racha y tu medalla de Plata. Si tu éxito mensual baja del 50%, dirás adiós a tu medalla de Oro.</li>
          <li><span class="icon" style="color:#f9d423;">Cuello de Botella (Emparejamiento):</span> El sistema no te permitirá avanzar únicamente en tus hábitos fáciles. Si la diferencia de victorias entre tu mejor hábito y tu hábito más olvidado es mayor a 3 días, <b>se bloqueará tu progreso</b>. Tendrás que retomar los hábitos olvidados antes de seguir sumando victorias en los demás.</li>
        </ul>
      </div>

      <div class="kaizen-content">
        <app-habit-tracker [habits]="habits" (logUpdate)="onLogUpdate()"></app-habit-tracker>
        <app-medals-showcase [medals]="medals"></app-medals-showcase>
      </div>
    </div>
  `,
  styles: [`
    .kaizen-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .kaizen-header {
      margin-bottom: 2rem;
      text-align: center;
      background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.18);
      box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
      padding: 3rem;
      border-radius: 20px;
      color: #fff;
      background-color: #1a1a1a;
    }
    .kaizen-header h1 {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .kaizen-header h1 span {
      font-weight: 300;
      opacity: 0.8;
      background: none;
      -webkit-text-fill-color: #fff;
    }
    .kaizen-header p {
      font-size: 1.2rem;
      color: #aaa;
      max-width: 600px;
      margin: 0 auto;
    }
    .btn-back {
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-back:hover {
      background: rgba(255,255,255,0.2);
      transform: translateX(-5px);
    }
    .btn-tutorial {
      background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%);
      color: black;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 30px;
      font-weight: bold;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-tutorial:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(249, 212, 35, 0.4);
    }
    .tutorial-card {
      background: #1e1e1e;
      border: 1px solid #f9d423;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      color: #ddd;
      box-shadow: 0 10px 30px rgba(249, 212, 35, 0.1);
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .tutorial-card h3 {
      color: #f9d423;
      margin-top: 0;
    }
    .tutorial-card ul {
      line-height: 1.8;
      padding-left: 1.5rem;
    }
    .tutorial-card .icon {
      font-weight: bold;
      color: #fff;
    }
    .kaizen-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 1024px) {
      .kaizen-content {
        grid-template-columns: 1fr;
      }
    }
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
