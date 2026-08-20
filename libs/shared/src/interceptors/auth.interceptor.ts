import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '@shared';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Always send cookies cross-origin
    request = request.clone({ withCredentials: true });

    // Skip refresh on login/register to avoid double-cookie issues
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && request.url.includes('/auth/refresh')) {
          this.emitLogout();
          return throwError(() => error);
        }

        if (error.status === 401) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const authService = this.injector.get(AuthService);

      return this.httpPostRefresh().pipe(
        switchMap(() => {
          this.isRefreshing = true; // cookie is now set, retry original request
          this.refreshTokenSubject.next('refreshed');
          return next.handle(request.clone({ withCredentials: true }));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.emitLogout();
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(request.clone({ withCredentials: true })))
    );
  }

  private httpPostRefresh(): Observable<unknown> {
    const authService = this.injector.get(AuthService);
    return authService.refreshSession();
  }

  private emitLogout(): void {
    const authService = this.injector.get(AuthService);
    authService.logout();
  }
}
