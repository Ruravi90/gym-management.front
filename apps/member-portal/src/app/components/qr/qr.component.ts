import { Component, OnInit, OnDestroy } from '@angular/core';
import { QrService } from '@shared';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr',
  template: `
    <div class="qr-page">
      <div class="qr-card">
        <div class="qr-header">
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
  qrDataUrl: string = '';
  timeLeft: number = 30;
  refreshing: boolean = false;
  private intervalId: any;
  private timerId: any;

  constructor(private qrService: QrService) {}

  ngOnInit(): void {
    this.generateQr();
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.timerId);
  }

  generateQr(): void {
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
  }

  startTimer(): void {
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.generateQr();
      }
    }, 1000);
  }
}
