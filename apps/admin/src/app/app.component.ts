import { Component, HostListener, OnInit } from '@angular/core';
import { VersionService } from '@shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'gym-management-frontend';
  updateAvailable = false;
  canInstall = false;
  private installPrompt: any;

  constructor(private versionService: VersionService) {}

  ngOnInit(): void {
    this.versionService.updateAvailable$.subscribe(value => this.updateAvailable = value);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onInstallPrompt(event: Event): void { event.preventDefault(); this.installPrompt = event; this.canInstall = true; }
  installApp(): void { if (!this.installPrompt) return; this.installPrompt.prompt(); this.installPrompt.userChoice.finally(() => { this.installPrompt = null; this.canInstall = false; }); }
  dismissInstall(): void { this.canInstall = false; }
  dismissUpdate(): void { this.updateAvailable = false; }
  applyUpdate(): void { this.versionService.applyUpdate(); }
}
