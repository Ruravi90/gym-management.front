import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  isOnCheckinPage(): boolean {
    return this.router.url === '/checkin' || this.router.url.startsWith('/checkin');
  }

  isPremiumPage(): boolean {
    const urls = ['/login', '/dashboard', '/memberships', '/clients', '/client-membership-history'];
    return urls.some(url => this.router.url === url || this.router.url.startsWith(url));
  }
}