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
  isMobileView = false;

  constructor(
    private authService: AuthService,
    public versionService: VersionService // Public to access in template
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  checkScreenSize() {
    const isSmallScreen = window.innerWidth < 768;
    this.isMobileView = isSmallScreen;

    // On mobile, we want the sidebar to be hidden initially
    // On desktop/tablet, we might want different behavior
    if (isSmallScreen) {
      this.sidebarCollapsed = true;
    } else {
      // Optionally reset to expanded on larger screens
      this.sidebarCollapsed = false;
    }
  }

  toggleSidebar() {
    // On mobile, just toggle visibility
    // On desktop/tablet, toggle between wide/narrow
    if (this.isMobileView) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  onNavItemClick() {
    // On mobile, close the sidebar when a navigation item is clicked
    if (this.isMobileView) {
      this.sidebarCollapsed = true;
    }
  }

  logout() {
    this.authService.logout();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}
