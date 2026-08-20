import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '@shared';

@Component({
  selector: 'app-member-layout',
  templateUrl: './member-layout.component.html',
  styleUrls: ['./member-layout.component.css']
})
export class MemberLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  isMobileView = false;
  userName = 'Socio';

  private readonly MOBILE_BREAKPOINT = 769;
  private resizeHandler: (() => void) | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.name) {
      this.userName = user.name;
    }
    this.checkScreenSize();
    this.resizeHandler = () => this.checkScreenSize();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  checkScreenSize() {
    const width = window.innerWidth;
    const wasMobile = this.isMobileView;
    this.isMobileView = width < this.MOBILE_BREAKPOINT;

    if (this.isMobileView) {
      this.sidebarCollapsed = true;
    } else if (wasMobile && !this.isMobileView) {
      this.sidebarCollapsed = false;
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onNavItemClick() {
    if (this.isMobileView) {
      this.sidebarCollapsed = true;
    }
  }

  logout() {
    this.authService.logout();
  }
}
