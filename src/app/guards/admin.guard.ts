import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const allowedRoles = ['super_admin', 'admin', 'receptionist'];

    // If we already have current user, check role
    const current = this.authService.getCurrentUser();
    if (current) {
      return allowedRoles.includes(current.role);
    }

    // Otherwise attempt to fetch current user from API (if token exists)
    return this.authService.fetchCurrentUser().pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        if (!allowedRoles.includes(user.role)) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}
// AdminGuard removed — left intentionally blank per cleanup request.
// If you want to re-add role-based guards, implement them in `src/app/guards/`.

