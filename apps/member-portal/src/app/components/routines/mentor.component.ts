import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  MentorService,
  BODY_TYPES,
  TRAINING_GOALS,
  TRAINING_EQUIPMENT,
  TRAINING_EXPERIENCE
} from '@shared';

interface ChatMessage {
  role: 'user' | 'mentor';
  text: string;
}

@Component({
  selector: 'app-mentor',
  template: `
    <div class="container">
      <header class="header">
        <div class="back-row">
          <button routerLink="/rutinas" class="btn-back">⬅️ Volver a Mis Rutinas</button>
        </div>
        <h1>🤖 FitMentor</h1>
        <p>Tu coach personal con IA. Pregúntale sobre técnica, series, peso o progresión de tu rutina.</p>
        <div class="header-actions">
          <button class="btn-generate" (click)="openWizard()" [disabled]="loading || generating">
            🎯 Generar mi rutina con IA
          </button>
          <button class="btn-weekly" (click)="weeklyCheckin()" [disabled]="loading">
            📅 Generar mi reporte semanal
          </button>
        </div>
      </header>

      <!-- Wizard: genera la rutina en 2 pasos (primero pregunta el tipo de cuerpo) -->
      <div class="wizard" *ngIf="showWizard">
        <div class="wizard-head">
          <span>🤖 FitMentor</span>
          <button class="wizard-close" (click)="closeWizard()">✕</button>
        </div>

        <ng-container *ngIf="wizardStep === 'body'">
          <p class="wizard-question">Para diseñar tu rutina ideal, primero necesito saber: ¿qué tipo de cuerpo tienes? 🧬</p>
          <div class="body-types">
            <button *ngFor="let bt of bodyTypes" class="body-card" (click)="selectBodyType(bt.value)">
              <strong>{{ bt.label }}</strong>
              <span>{{ bt.description }}</span>
            </button>
          </div>
        </ng-container>

        <ng-container *ngIf="wizardStep === 'details'">
          <p class="wizard-question">Perfecto, <strong>{{ bodyTypeLabel }}</strong> 💪. Ahora cuéntame sobre tu entrenamiento:</p>
          <div class="wizard-grid">
            <label>Objetivo
              <select [(ngModel)]="goal">
                <option *ngFor="let g of goals" [value]="g.value">{{ g.label }}</option>
              </select>
            </label>
            <label>Días por semana
              <select [(ngModel)]="daysPerWeek">
                <option *ngFor="let d of dayOptions" [value]="d">{{ d }} día(s)</option>
              </select>
            </label>
            <label>Equipamiento
              <select [(ngModel)]="equipment">
                <option *ngFor="let e of equipments" [value]="e.value">{{ e.label }}</option>
              </select>
            </label>
            <label>Experiencia
              <select [(ngModel)]="experience">
                <option *ngFor="let x of experiences" [value]="x.value">{{ x.label }}</option>
              </select>
            </label>
            <label>Duración por sesión
              <select [(ngModel)]="durationMinutes">
                <option *ngFor="let m of durationOptions" [value]="m">{{ m }} min</option>
              </select>
            </label>
          </div>
          <div class="wizard-actions">
            <button class="btn-back" (click)="goBackToBody()">⬅️ Tipo de cuerpo</button>
            <button class="btn-generate" (click)="generateRoutine()" [disabled]="generating">
              {{ generating ? 'Diseñando tu rutina...' : '🤖 Generar mi rutina' }}
            </button>
          </div>
        </ng-container>
      </div>

      <div class="chat">
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
          <button class="btn-weekly" (click)="openGeneratedRoutine()">Ver mi rutina 🏋️</button>
        </div>

        <div class="input-bar">
          <input type="text" class="input" [(ngModel)]="draft" (keyup.enter)="send(draft)"
            placeholder="Pregúntale a tu mentor..." [disabled]="loading || generating">
          <button class="btn-send" (click)="send(draft)" [disabled]="loading || generating || !draft.trim()">Enviar ➤</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 1rem; max-width: 760px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #eee; min-height: 100vh; display: flex; flex-direction: column; }
    .header { text-align: center; background: rgba(18,18,18,0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 1.5rem; margin-bottom: 1rem; }
    .header h1 { margin: 0; font-size: 2rem; background: linear-gradient(to right, #f9d423 0%, #ff4e50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header p { color: #aaa; margin: 0.5rem 0 0; }
    .back-row { text-align: left; margin-bottom: 0.75rem; }
    .btn-back { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.6rem 1.2rem; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; }
    .header-actions { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem; }
    .btn-generate { background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; border: none; padding: 0.7rem 1.4rem; border-radius: 16px; font-weight: 800; cursor: pointer; font-size: 0.9rem; }
    .btn-weekly { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 0.7rem 1.4rem; border-radius: 16px; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .btn-generate:disabled, .btn-weekly:disabled { opacity: 0.5; cursor: default; }

    .wizard { background: rgba(18,18,18,0.9); border: 1px solid rgba(249,212,35,0.35); border-radius: 20px; padding: 1.25rem; margin-bottom: 1rem; }
    .wizard-head { display: flex; justify-content: space-between; align-items: center; font-weight: 800; color: #f9d423; margin-bottom: 0.5rem; }
    .wizard-close { background: none; border: none; color: #aaa; font-size: 1.1rem; cursor: pointer; }
    .wizard-question { margin: 0.5rem 0 1rem; color: #eee; font-size: 1.05rem; }
    .body-types { display: flex; flex-direction: column; gap: 0.6rem; }
    .body-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 0.9rem 1rem; color: #eee; cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 0.3rem; transition: all 0.2s; }
    .body-card:hover { border-color: #f9d423; background: rgba(249,212,35,0.1); }
    .body-card span { color: #aaa; font-size: 0.85rem; line-height: 1.4; }
    .wizard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
    .wizard-grid label { display: flex; flex-direction: column; gap: 0.3rem; color: #bbb; font-size: 0.85rem; font-weight: 600; }
    .wizard-grid select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #eee; padding: 0.6rem 0.7rem; font-size: 0.95rem; outline: none; }
    .wizard-grid select:focus { border-color: #f9d423; }
    .wizard-actions { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; margin-top: 1.1rem; }
    .wizard-actions .btn-back { font-size: 0.85rem; }

    .chat { display: flex; flex-direction: column; flex: 1; background: rgba(18,18,18,0.7); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; min-height: 55vh; }
    .messages { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .bubble { display: flex; gap: 0.6rem; align-items: flex-start; max-width: 85%; }
    .avatar { font-size: 1.6rem; }
    .text { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 0.75rem 1rem; color: #eee; line-height: 1.5; white-space: pre-wrap; }
    .user-text { background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; font-weight: 600; align-self: flex-end; }
    .bubble:has(.user-text) { align-self: flex-end; flex-direction: row-reverse; }
    .typing { color: #aaa; }
    .dots { animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    .welcome { text-align: center; padding: 2rem 1rem; color: #ddd; }
    .muted { color: #888; font-size: 0.9rem; }
    .quick { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; max-width: 420px; margin-left: auto; margin-right: auto; }
    .quick-btn { background: rgba(249,212,35,0.08); color: #f9d423; border: 1px solid rgba(249,212,35,0.3); border-radius: 14px; padding: 0.7rem 1rem; cursor: pointer; font-size: 0.9rem; text-align: left; transition: all 0.2s; }
    .quick-btn:hover { background: rgba(249,212,35,0.15); }
    .cta { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; padding: 0.8rem 1.1rem; border-top: 1px solid rgba(249,212,35,0.2); background: rgba(249,212,35,0.06); }
    .cta span { color: #ddd; font-size: 0.9rem; }
    .cta .btn-weekly { background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; padding: 0.55rem 1.1rem; border: none; }
    .input-bar { display: flex; gap: 0.5rem; padding: 0.9rem; border-top: 1px solid rgba(255,255,255,0.07); }
    .input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #eee; padding: 0.75rem 1rem; font-size: 0.95rem; outline: none; }
    .input:focus { border-color: #f9d423; }
    .btn-send { background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; border: none; border-radius: 12px; padding: 0.75rem 1.4rem; font-weight: 800; cursor: pointer; }
    .btn-send:disabled { opacity: 0.5; }
    @media (min-width: 768px) { .container { padding: 2rem; } }
    @media (max-width: 480px) { .wizard-grid { grid-template-columns: 1fr; } }
  `]
})
export class MentorComponent implements OnInit {
  messages: ChatMessage[] = [];
  draft = '';
  loading = false;

  // Wizard de generación de rutina
  showWizard = false;
  wizardStep: 'body' | 'details' = 'body';
  bodyType = '';
  goal = 'general';
  daysPerWeek = 3;
  equipment = 'gimnasio';
  experience = 'principiante';
  durationMinutes = 60;
  generating = false;
  generatedRoutineId?: number;
  generatedRoutineName = '';

  bodyTypes = BODY_TYPES;
  goals = TRAINING_GOALS;
  equipments = TRAINING_EQUIPMENT;
  experiences = TRAINING_EXPERIENCE;
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
    // Si ya conocemos su tipo de cuerpo, saltamos directo a los detalles
    this.mentorService.getBodyType().subscribe({
      next: (res) => {
        if (res.body_type) {
          this.bodyType = res.body_type;
          this.wizardStep = 'details';
        } else {
          this.wizardStep = 'body';
        }
      },
      error: () => { this.wizardStep = 'body'; }
    });
  }

  selectBodyType(value: string): void {
    this.bodyType = value;
    this.wizardStep = 'details';
  }

  goBackToBody(): void {
    this.wizardStep = 'body';
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
