import { Component } from '@angular/core';
import { AuthService } from '@shared';

@Component({
  selector: 'app-platform-layout',
  templateUrl: './platform-layout.component.html',
  styleUrls: ['./platform-layout.component.css']
})
export class PlatformLayoutComponent {
  sidebarOpen = false;
  constructor(private authService: AuthService) {}

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }

  logout(): void {
    this.authService.logout();
  }
}
