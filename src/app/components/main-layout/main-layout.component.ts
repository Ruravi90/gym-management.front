import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    public versionService: VersionService, // Public to access in template
    private router: Router
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

  // Pull-to-refresh properties
  startY: number = 0;
  currentY: number = 0;
  isDragging: boolean = false;
  showRefreshIndicator: boolean = false;
  refreshRotation: number = 0;
  isRefreshing: boolean = false;

  onNavItemClick() {
    // On mobile, close the sidebar when a navigation item is clicked
    if (this.isMobileView) {
      this.sidebarCollapsed = true;
    }
  }

  onTouchStart(event: TouchEvent) {
    if (this.isRefreshing) return;

    this.startY = event.touches[0].clientY;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || this.isRefreshing) return;

    this.currentY = event.touches[0].clientY;
    const diffY = this.currentY - this.startY;

    // Only allow pull-down gesture from the top of the page
    if (diffY > 0) {
      // Limit the refresh indicator to a maximum distance
      const pullDistance = Math.min(diffY, 100);

      // Show refresh indicator when pulled down
      this.showRefreshIndicator = pullDistance > 20;

      // Rotate spinner based on pull distance
      this.refreshRotation = (pullDistance / 100) * 180;

      // Prevent default scrolling behavior when pulling down
      if (diffY > 10) {
        event.preventDefault();
      }
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging || this.isRefreshing) return;

    const diffY = this.currentY - this.startY;

    // Trigger refresh if pulled down far enough
    if (diffY > 60) {
      this.triggerRefresh();
    }

    // Reset state
    this.isDragging = false;
    this.showRefreshIndicator = false;
    this.refreshRotation = 0;
  }

  triggerRefresh() {
    this.isRefreshing = true;

    // Simulate refresh delay
    setTimeout(() => {
      // Reload the current route to refresh content
      const currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });

      this.isRefreshing = false;
    }, 1500);
  }

  logout() {
    this.authService.logout();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}
