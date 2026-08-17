import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  MentorService,
  BODY_TYPES,
  TRAINING_GOALS,
  TRAINING_EQUIPMENT,
  TRAINING_EXPERIENCE,
  SEX_OPTIONS,
  ACTIVITY_LEVELS
} from '@shared';

interface ChatMessage {
  role: 'user' | 'mentor';
  text: string;
}

@Component({
  selector: 'app-mentor',
  template: `
    <div class="page-container mentor-container">
      <header class="page-header">
        <div class="back-row">
          <button routerLink="/rutinas" class="btn btn-ghost btn-sm">← Volver a Mis Rutinas</button>
        </div>
        <h1>FitMentor</h1>
        <p>Tu coach personal con IA. Pregúntale sobre técnica, series, peso o progresión de tu rutina.</p>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openWizard()" [disabled]="loading || generating">
            🎯 Generar mi rutina con IA
          </button>
          <button class="btn btn-outline" (click)="weeklyCheckin()" [disabled]="loading">
            📅 Generar mi reporte semanal
          </button>
        </div>
      </header>

      <!-- Wizard: genera la rutina en 3 pasos (intake del instructor) -->
      <div class="card wizard" *ngIf="showWizard">
        <div class="wizard-head">
          <span class="wizard-title">🤖 FitMentor — Tu instructor</span>
          <button class="btn btn-ghost btn-sm" (click)="closeWizard()">✕</button>
        </div>

        <ng-container *ngIf="wizardStep === 'body'">
          <p class="wizard-question">Como tu instructor, primero necesito conocer tu cuerpo. ¿Qué tipo de cuerpo tienes?</p>
          <div class="body-types">
            <button *ngFor="let bt of bodyTypes" class="body-card" (click)="selectBodyType(bt.value)">
              <strong>{{ bt.label }}</strong>
              <span>{{ bt.description }}</span>
            </button>
          </div>
        </ng-container>

        <ng-container *ngIf="wizardStep === 'physical'">
          <p class="wizard-question">Perfecto, <strong>{{ bodyTypeLabel }}</strong>. Ahora tus datos físicos (necesarios para calcular tu IMC y adaptar el plan):</p>
          <div class="wizard-grid">
            <label class="field">Altura
              <input type="number" class="app-input" [(ngModel)]="heightCm" placeholder="Ej. 175">
              <span class="unit">cm</span>
            </label>
            <label class="field">Peso actual (opcional)
              <input type="number" class="app-input" [(ngModel)]="weightKg" placeholder="Ej. 75">
              <span class="unit">kg</span>
            </label>
            <label class="field">Edad
              <input type="number" class="app-input" [(ngModel)]="age" placeholder="Ej. 25">
              <span class="unit">años</span>
            </label>
            <label class="field">Sexo
              <select class="app-input" [(ngModel)]="sex">
                <option value="">Selecciona...</option>
                <option *ngFor="let s of sexOptions" [value]="s.value">{{ s.label }}</option>
              </select>
            </label>
          </div>
          <div class="wizard-actions">
            <button class="btn btn-outline" (click)="goBackToBody()">← Tipo de cuerpo</button>
            <button class="btn btn-primary" (click)="nextToTraining()">Siguiente: objetivo y entrenamiento →</button>
          </div>
        </ng-container>

        <ng-container *ngIf="wizardStep === 'training'">
          <p class="wizard-question">Ya casi. Ahora cuéntame sobre tu objetivo y tu entrenamiento:</p>
          <div class="wizard-grid">
            <label class="field">Objetivo principal
              <select class="app-input" [(ngModel)]="goal">
                <option *ngFor="let g of goals" [value]="g.value">{{ g.label }}</option>
              </select>
            </label>
            <label class="field">Días por semana
              <select class="app-input" [(ngModel)]="daysPerWeek">
                <option *ngFor="let d of dayOptions" [value]="d">{{ d }} día(s)</option>
              </select>
            </label>
            <label class="field">Equipamiento
              <select class="app-input" [(ngModel)]="equipment">
                <option *ngFor="let e of equipments" [value]="e.value">{{ e.label }}</option>
              </select>
            </label>
            <label class="field">Experiencia
              <select class="app-input" [(ngModel)]="experience">
                <option *ngFor="let x of experiences" [value]="x.value">{{ x.label }}</option>
              </select>
            </label>
            <label class="field">Duración por sesión
              <select class="app-input" [(ngModel)]="durationMinutes">
                <option *ngFor="let m of durationOptions" [value]="m">{{ m }} min</option>
              </select>
            </label>
            <label class="field">Actividad diaria (fuera del gym)
              <select class="app-input" [(ngModel)]="dailyActivity">
                <option value="">Selecciona...</option>
                <option *ngFor="let a of activityLevels" [value]="a.value">{{ a.label }}</option>
              </select>
            </label>
          </div>
          <label class="field mt-1">¿Lesiones o limitaciones físicas? (opcional)
            <textarea class="app-input" rows="2" [(ngModel)]="injuries" placeholder="Ej. dolor de rodilla al sentadillar, hernia lumbar..."></textarea>
          </label>
          <div class="wizard-actions">
            <button class="btn btn-outline" (click)="goBackToPhysical()">← Datos físicos</button>
            <button class="btn btn-primary" (click)="generateRoutine()" [disabled]="generating">
              {{ generating ? 'Diseñando tu rutina...' : '🤖 Generar mi rutina' }}
            </button>
          </div>
        </ng-container>
      </div>

      <div class="chat card">
        <div class="messages" #scrollContainer>
          <div class="bubble mentor" *ngFor="let msg of messages">
            <span class="avatar">{{ msg.role === 'mentor' ? '🤖' : '🧑' }}</span>
            <div class="text" [class.user-text]="msg.role === 'user'">{{ msg.text }}</div>
          </div>
          <div class="bubble mentor" *ngIf="loading || generating">
            <span class="avatar">🤖</span>
            <div class="text typing">{{ generating ? 'Diseñando tu rutina' : 'Escribiendo' }}<span class="dots">...</span></div>
          </div>
          <div class="welcome" *ngIf="messages.length === 0 && !loading && !generating">
            <p>¡Hola! Soy tu mentor de entrenamiento 💪</p>
            <p class="muted">Puedo ayudarte con tu rutina y progreso. Prueba alguna de estas preguntas:</p>
            <div class="quick">
              <button *ngFor="let q of quickQuestions" class="quick-btn" (click)="send(q)">{{ q }}</button>
            </div>
          </div>
        </div>

        <div class="cta" *ngIf="generatedRoutineId">
          <span>🎉 Tu rutina <strong>{{ generatedRoutineName }}</strong> está lista, con GIFs y seguimiento.</span>
          <button class="btn btn-primary btn-sm" (click)="openGeneratedRoutine()">Ver mi rutina 🏋️</button>
        </div>

        <div class="input-bar">
          <input type="text" class="app-input" [(ngModel)]="draft" (keyup.enter)="send(draft)"
            placeholder="Pregúntale a tu mentor..." [disabled]="loading || generating">
          <button class="btn btn-primary" (click)="send(draft)" [disabled]="loading || generating || !draft.trim()">Enviar →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mentor-container { max-width: 780px; }
    .header-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }

    .wizard { margin-bottom: 1.25rem; border-color: var(--app-primary-soft-border); }
    .wizard-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--app-border);
      padding-bottom: 0.75rem;
      margin-bottom: 1rem;
    }
    .wizard-title { font-weight: 800; color: var(--lime-700); }
    .wizard-question { margin: 0 0 1rem; font-size: 1.02rem; font-weight: 500; }

    .body-types { display: flex; flex-direction: column; gap: 0.6rem; }
    .body-card {
      background: var(--slate-50);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-md);
      padding: 0.9rem 1rem;
      color: var(--text-main);
      cursor: pointer;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      transition: all 0.15s;
      font-family: var(--font-sans);
    }
    .body-card:hover {
      border-color: var(--app-primary);
      background: var(--app-primary-soft);
    }
    .body-card span { color: var(--text-muted); font-size: 0.85rem; line-height: 1.45; }

    .wizard-grid { display: grid; grid-template-columns: 1fr; gap: 0.4rem; }
    @media (min-width: 560px) { .wizard-grid { grid-template-columns: 1fr 1fr; gap: 0 1rem; } }
    .unit { color: var(--text-muted); font-size: 0.75rem; }
    .wizard-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.6rem;
      margin-top: 1.25rem;
      flex-wrap: wrap;
    }

    .chat {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      min-height: 55vh;
    }
    .messages { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .bubble { display: flex; gap: 0.6rem; align-items: flex-start; max-width: 88%; }
    .avatar { font-size: 1.5rem; }
    .text {
      background: var(--slate-50);
      border: 1px solid var(--app-border);
      border-radius: 14px;
      padding: 0.75rem 1rem;
      color: var(--text-main);
      line-height: 1.55;
      white-space: pre-wrap;
      font-size: 0.93rem;
    }
    .user-text {
      background: var(--app-primary);
      color: var(--app-on-primary);
      font-weight: 600;
      align-self: flex-end;
      border-color: var(--app-primary);
    }
    .bubble:has(.user-text) { align-self: flex-end; flex-direction: row-reverse; }
    .typing { color: var(--text-muted); }
    .dots { animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    .welcome { text-align: center; padding: 2rem 1rem; }
    .quick { display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem auto 0; max-width: 440px; }
    .quick-btn {
      background: var(--app-primary-soft);
      color: var(--lime-700);
      border: 1px solid var(--app-primary-soft-border);
      border-radius: var(--radius-md);
      padding: 0.7rem 1rem;
      cursor: pointer;
      font-size: 0.9rem;
      text-align: left;
      transition: all 0.15s;
      font-family: var(--font-sans);
      font-weight: 600;
    }
    .quick-btn:hover { background: var(--lime-100); }

    .cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      flex-wrap: wrap;
      padding: 0.9rem 1.1rem;
      border-top: 1px solid var(--app-border);
      background: var(--app-primary-soft);
    }
    .cta span { font-size: 0.9rem; }

    .input-bar { display: flex; gap: 0.5rem; padding: 0.9rem; border-top: 1px solid var(--app-border); }
  `]
})
export class MentorComponent implements OnInit {
  messages: ChatMessage[] = [];
  draft = '';
  loading = false;

  // Wizard de generación de rutina (intake del instructor en 3 pasos)
  showWizard = false;
  wizardStep: 'body' | 'physical' | 'training' = 'body';
  // Paso 1: tipo de cuerpo
  bodyType = '';
  // Paso 2: datos físicos
  heightCm: number | null = null;
  weightKg: number | null = null;
  age: number | null = null;
  sex = '';
  // Paso 3: objetivo y entrenamiento
  goal = 'general';
  daysPerWeek = 3;
  equipment = 'gimnasio';
  experience = 'principiante';
  durationMinutes = 60;
  dailyActivity = '';
  injuries = '';
  generating = false;
  generatedRoutineId?: number;
  generatedRoutineName = '';

  bodyTypes = BODY_TYPES;
  goals = TRAINING_GOALS;
  equipments = TRAINING_EQUIPMENT;
  experiences = TRAINING_EXPERIENCE;
  sexOptions = SEX_OPTIONS;
  activityLevels = ACTIVITY_LEVELS;
  dayOptions = [2, 3, 4, 5, 6];
  durationOptions = [30, 45, 60, 90];

  quickQuestions = [
    '¿Cómo hago bien el press de banca?',
    '¿Qué peso debo usar si soy principiante?',
    '¿Cuánto descanso entre series?',
    '¿Cómo progreso en mis ejercicios?'
  ];

  constructor(private mentorService: MentorService, private router: Router) { }

  ngOnInit(): void {
    this.messages = [
      {
        role: 'mentor',
        text: '¡Hola! 👋 Soy FitMentor, tu coach personal. Conozco tu rutina y tu progreso. ¿En qué te ayudo hoy?'
      }
    ];
  }

  get bodyTypeLabel(): string {
    const found = this.bodyTypes.find(b => b.value === this.bodyType);
    return found ? found.label : this.bodyType;
  }

  send(text: string): void {
    const message = (text || '').trim();
    if (!message || this.loading || this.generating) { return; }
    this.messages.push({ role: 'user', text: message });
    this.draft = '';
    this.loading = true;
    this.mentorService.chat(message).subscribe({
      next: (res) => {
        this.loading = false;
        this.messages.push({ role: 'mentor', text: res.reply });
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        const detail = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        this.messages.push({ role: 'mentor', text: 'Lo siento, hubo un problema: ' + detail });
        this.scrollToBottom();
      }
    });
    this.scrollToBottom();
  }

  weeklyCheckin(): void {
    if (this.loading || this.generating) { return; }
    this.loading = true;
    this.mentorService.weeklyCheckin().subscribe({
      next: (res) => {
        this.loading = false;
        this.messages.push({ role: 'mentor', text: res.reply });
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        const detail = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        this.messages.push({ role: 'mentor', text: 'Lo siento, no pude generar tu reporte: ' + detail });
        this.scrollToBottom();
      }
    });
  }

  // ---------- Wizard de generación de rutina ----------
  openWizard(): void {
    if (this.loading || this.generating) { return; }
    this.showWizard = true;
    // Cargar el perfil guardado para saltar los pasos ya completados
    this.mentorService.getProfile().subscribe({
      next: (profile) => {
        if (profile.body_type) { this.bodyType = profile.body_type; }
        if (profile.height_cm) { this.heightCm = profile.height_cm; }
        if (profile.weight_kg) { this.weightKg = profile.weight_kg; }
        if (profile.age) { this.age = profile.age; }
        if (profile.sex) { this.sex = profile.sex; }
        if (profile.daily_activity) { this.dailyActivity = profile.daily_activity; }
        if (profile.injuries) { this.injuries = profile.injuries; }
        this.wizardStep = this.bodyType ? 'physical' : 'body';
      },
      error: () => { this.wizardStep = 'body'; }
    });
  }

  selectBodyType(value: string): void {
    this.bodyType = value;
    this.wizardStep = 'physical';
  }

  goBackToBody(): void {
    this.wizardStep = 'body';
  }

  nextToTraining(): void {
    this.wizardStep = 'training';
  }

  goBackToPhysical(): void {
    this.wizardStep = 'physical';
  }

  closeWizard(): void {
    if (this.generating) { return; }
    this.showWizard = false;
  }

  generateRoutine(): void {
    if (this.generating) { return; }
    this.generating = true;
    this.mentorService.generateRoutine({
      body_type: this.bodyType,
      height_cm: this.heightCm ?? undefined,
      weight_kg: this.weightKg ?? undefined,
      age: this.age ?? undefined,
      sex: this.sex || undefined,
      daily_activity: this.dailyActivity || undefined,
      injuries: this.injuries || undefined,
      goal: this.goal,
      days_per_week: this.daysPerWeek,
      equipment: this.equipment,
      experience: this.experience,
      duration_minutes: this.durationMinutes
    }).subscribe({
      next: (res) => {
        this.generating = false;
        this.showWizard = false;
        // El mentor pidió primero el tipo de cuerpo
        if (res.ask_body_type) {
          this.wizardStep = 'body';
          this.showWizard = true;
        }
        this.messages.push({ role: 'mentor', text: res.reply });
        if (res.ok && res.routine_id) {
          this.generatedRoutineId = res.routine_id;
          this.generatedRoutineName = res.routine_name || '';
        }
        this.scrollToBottom();
      },
      error: (err) => {
        this.generating = false;
        const detail = err.error && err.error.detail ? err.error.detail : (err.message || 'Error');
        this.messages.push({ role: 'mentor', text: 'Lo siento, no pude generar tu rutina: ' + detail });
        this.scrollToBottom();
      }
    });
  }

  openGeneratedRoutine(): void {
    if (this.generatedRoutineId) {
      this.router.navigate(['/rutinas', this.generatedRoutineId]);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages');
      if (container) { container.scrollTop = container.scrollHeight; }
    }, 50);
  }
}
