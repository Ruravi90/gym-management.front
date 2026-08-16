import { Component, OnInit } from '@angular/core';
import { MentorService } from '@shared';

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
        <button class="btn-weekly" (click)="weeklyCheckin()" [disabled]="loading">
          📅 Generar mi reporte semanal
        </button>
      </header>

      <div class="chat">
        <div class="messages" #scrollContainer>
          <div class="bubble mentor" *ngFor="let msg of messages">
            <span class="avatar">{{ msg.role === 'mentor' ? '🤖' : '🧑' }}</span>
            <div class="text" [class.user-text]="msg.role === 'user'">{{ msg.text }}</div>
          </div>
          <div class="bubble mentor" *ngIf="loading">
            <span class="avatar">🤖</span>
            <div class="text typing">Escribiendo<span class="dots">...</span></div>
          </div>
          <div class="welcome" *ngIf="messages.length === 0 && !loading">
            <p>¡Hola! Soy tu mentor de entrenamiento 💪</p>
            <p class="muted">Puedo ayudarte con tu rutina y progreso. Prueba alguna de estas preguntas:</p>
            <div class="quick">
              <button *ngFor="let q of quickQuestions" class="quick-btn" (click)="send(q)">{{ q }}</button>
            </div>
          </div>
        </div>

        <div class="input-bar">
          <input type="text" class="input" [(ngModel)]="draft" (keyup.enter)="send(draft)"
            placeholder="Pregúntale a tu mentor..." [disabled]="loading">
          <button class="btn-send" (click)="send(draft)" [disabled]="loading || !draft.trim()">Enviar ➤</button>
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
    .btn-weekly { background: #ff4e50; color: #fff; border: none; padding: 0.7rem 1.4rem; border-radius: 16px; font-weight: 700; cursor: pointer; font-size: 0.9rem; margin-top: 1rem; }
    .btn-weekly:disabled { opacity: 0.5; }
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
    .input-bar { display: flex; gap: 0.5rem; padding: 0.9rem; border-top: 1px solid rgba(255,255,255,0.07); }
    .input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #eee; padding: 0.75rem 1rem; font-size: 0.95rem; outline: none; }
    .input:focus { border-color: #f9d423; }
    .btn-send { background: linear-gradient(to right, #f9d423, #ff4e50); color: #000; border: none; border-radius: 12px; padding: 0.75rem 1.4rem; font-weight: 800; cursor: pointer; }
    .btn-send:disabled { opacity: 0.5; }
    @media (min-width: 768px) { .container { padding: 2rem; } }
  `]
})
export class MentorComponent implements OnInit {
  messages: ChatMessage[] = [];
  draft = '';
  loading = false;

  quickQuestions = [
    '¿Cómo hago bien el press de banca?',
    '¿Qué peso debo usar si soy principiante?',
    '¿Cuánto descanso entre series?',
    '¿Cómo progreso en mis ejercicios?'
  ];

  constructor(private mentorService: MentorService) { }

  ngOnInit(): void {
    this.messages = [
      {
        role: 'mentor',
        text: '¡Hola! 👋 Soy FitMentor, tu coach personal. Conozco tu rutina y tu progreso. ¿En qué te ayudo hoy?'
      }
    ];
  }

  send(text: string): void {
    const message = (text || '').trim();
    if (!message || this.loading) { return; }
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
    if (this.loading) { return; }
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

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages');
      if (container) { container.scrollTop = container.scrollHeight; }
    }, 50);
  }
}
