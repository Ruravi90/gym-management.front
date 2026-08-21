import { Component } from '@angular/core';
import { AuthService } from '@shared';

@Component({
  selector: 'app-platform-layout',
  templateUrl: './platform-layout.component.html',
  styleUrls: ['./platform-layout.component.css']
})
export class PlatformLayoutComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
