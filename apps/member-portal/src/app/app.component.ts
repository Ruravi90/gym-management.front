import { Component, HostListener } from '@angular/core';
import { VersionService } from '@shared';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet><aside class="app-notices" aria-live="polite"><div class="app-notice" *ngIf="updateAvailable"><div><strong>Nueva versión disponible</strong><span>Actualiza para obtener las últimas mejoras.</span></div><button class="notice-primary" (click)="applyUpdate()">Actualizar</button><button class="notice-close" (click)="updateAvailable=false" aria-label="Cerrar">×</button></div><div class="app-notice" *ngIf="canInstall"><div><strong>Instala Mi GYM</strong><span>Accede más rápido desde tu dispositivo.</span></div><button class="notice-primary" (click)="installApp()">Instalar</button><button class="notice-close" (click)="canInstall=false" aria-label="Cerrar">×</button></div></aside>`,
  styles: [`.app-notices{position:fixed;right:20px;bottom:20px;z-index:2000;display:grid;gap:10px;width:min(420px,calc(100vw - 32px))}.app-notice{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#111827;color:#e2e8f0;border:1px solid #334155;border-radius:12px;box-shadow:0 12px 36px rgba(2,6,23,.28)}.app-notice div{display:grid;gap:3px;flex:1}.app-notice strong{font-size:.88rem;color:#f8fafc}.app-notice span{font-size:.76rem;color:#94a3b8}.notice-primary{border:0;border-radius:8px;padding:8px 12px;background:#84cc16;color:#17200b;font-weight:700;cursor:pointer}.notice-close{border:0;background:transparent;color:#94a3b8;font-size:1.25rem;cursor:pointer}@media(max-width:600px){.app-notices{right:12px;bottom:12px}.app-notice{align-items:flex-start;flex-wrap:wrap}.app-notice .notice-primary{margin-left:auto}}`]
})
export class AppComponent {
  updateAvailable = false;
  canInstall = false;
  private installPrompt: any;
  constructor(private versionService: VersionService) { this.versionService.updateAvailable$.subscribe(value => this.updateAvailable = value); }
  @HostListener('window:beforeinstallprompt', ['$event']) onInstallPrompt(event: Event): void { event.preventDefault(); this.installPrompt = event; this.canInstall = true; }
  installApp(): void { if (!this.installPrompt) return; this.installPrompt.prompt(); this.installPrompt.userChoice.finally(() => { this.installPrompt = null; this.canInstall = false; }); }
  applyUpdate(): void { this.versionService.applyUpdate(); }
}
