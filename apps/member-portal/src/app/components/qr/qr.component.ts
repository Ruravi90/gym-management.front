import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { QrService, AuthService } from '@shared';
import { Subscription } from 'rxjs';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr',
  template: `
    <div class="qr-page">
      <div class="qr-card">
        <div class="qr-header">
          <button class="back-btn" (click)="goBack()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>
          <h1>Mi Código QR</h1>
          <p class="subtitle">Presenta este código en recepción para registrar tu asistencia</p>
        </div>

        <div class="qr-display">
          <div class="qr-frame" [class.expired]="timeLeft <= 5" [class.refreshing]="refreshing">
            <canvas id="qr-canvas" width="240" height="240"></canvas>
            <div class="qr-overlay" *ngIf="refreshing">
              <div class="spinner"></div>
            </div>
          </div>
        </div>

        <div class="pin-section" *ngIf="pin">
          <p class="pin-label">O ingresa este PIN en recepción:</p>
          <div class="pin-display" [class.expired]="timeLeft <= 5">
            <span class="pin-digit" *ngFor="let d of pinDigits">{{ d }}</span>
          </div>
        </div>

        <div class="qr-footer">
          <div class="timer" [class.urgent]="timeLeft <= 10">
            <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Se renueva en {{ timeLeft }}s</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(timeLeft / 30) * 100"
                 [class.urgent]="timeLeft <= 10"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qr-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .qr-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      padding: 2rem;
      max-width: 380px;
      width: 100%;
      text-align: center;
    }

    .qr-header {
      position: relative;
    }

    .back-btn {
      position: absolute;
      top: -0.5rem;
      left: -0.5rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: none;
      border: none;
      color: var(--app-primary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.4rem 0.6rem;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .back-btn:hover {
      background: var(--lime-50);
    }

    .back-btn svg {
      width: 16px;
      height: 16px;
    }

    .qr-header h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 0.25rem;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin: 0 0 1.5rem;
    }

    .qr-display {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .qr-frame {
      position: relative;
      background: white;
      border: 3px solid var(--app-primary);
      border-radius: 16px;
      padding: 12px;
      transition: border-color 0.3s;
    }

    .qr-frame.expired {
      border-color: var(--danger);
      animation: pulse-border 1s infinite;
    }

    .qr-frame.refreshing {
      opacity: 0.6;
    }

    @keyframes pulse-border {
      0%, 100% { border-color: var(--danger); }
      50% { border-color: transparent; }
    }

    .qr-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 13px;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--app-border);
      border-top-color: var(--app-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    #qr-canvas {
      display: block;
    }

    .pin-section {
      margin-bottom: 1.5rem;
    }

    .pin-label {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin: 0 0 0.6rem;
    }

    .pin-display {
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      transition: opacity 0.3s;
    }

    .pin-display.expired {
      opacity: 0.4;
    }

    .pin-digit {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 48px;
      background: var(--app-bg);
      border: 2px solid var(--app-primary);
      border-radius: 10px;
      font-size: 1.5rem;
      font-weight: 800;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--text-main);
    }

    .qr-footer {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
      transition: color 0.3s;
    }

    .timer.urgent {
      color: var(--danger);
    }

    .timer-icon {
      width: 18px;
      height: 18px;
    }

    .progress-bar {
      height: 4px;
      background: var(--slate-200);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--app-primary);
      border-radius: 2px;
      transition: width 1s linear, background 0.3s;
    }

    .progress-fill.urgent {
      background: var(--danger);
    }
  `]
})
export class QrComponent implements OnInit, OnDestroy {
  pin: string = '';
  pinDigits: string[] = [];
  timeLeft: number = 30;
  refreshing: boolean = false;
  private timerId: any;
  private wsSub?: Subscription;

  constructor(
    private qrService: QrService,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.generateCredentials();
    this.startTimer();
    this.connectWs();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerId);
    this.wsSub?.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }

  generateCredentials(): void {
    this.refreshing = true;
    this.qrService.getMyQrToken().subscribe({
      next: (res) => {
        QRCode.toCanvas(document.getElementById('qr-canvas'), res.token, {
          width: 240,
          margin: 1,
          color: { dark: '#1e293b', light: '#ffffff' }
        }, (err) => {
          if (err) console.error('QR generation error:', err);
          this.refreshing = false;
        });
        this.timeLeft = res.expires_in || 30;
      },
      error: (err) => {
        console.error('Error fetching QR token:', err);
        this.refreshing = false;
      }
    });

    this.qrService.getMyPin().subscribe({
      next: (res) => {
        this.pin = res.pin;
        this.pinDigits = res.pin.split('');
      },
      error: (err) => {
        console.error('Error fetching PIN:', err);
      }
    });
  }

  startTimer(): void {
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.generateCredentials();
      }
    }, 1000);
  }

  private connectWs(): void {
    this.authService.fetchCurrentUser().subscribe({
      next: (user) => {
        console.log('[QR] connectWs - user:', user?.id);
        if (!user) return;
        this.wsSub = this.qrService.connectCheckinWs(user.id).subscribe({
          next: (event) => {
            console.log('[QR] WS event received:', event);
            clearInterval(this.timerId);
            this.refreshing = true;
            this.router.navigate(['/dashboard'], { queryParams: { checkin: event.status === 'success' ? 'success' : 'error', msg: event.message } });
          }
        });
      }
    });
  }
}
