import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  sidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    public versionService: VersionService // Public to access in template
  ) { }

  ngOnInit(): void {
    // Auto-collapse on small screens
    if (window.innerWidth < 1024) {
      this.sidebarCollapsed = true;
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.authService.logout();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}
