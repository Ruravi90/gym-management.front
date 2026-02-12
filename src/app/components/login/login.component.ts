import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  returnUrl = '/dashboard'; // Default redirect route

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // If user is already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Por favor ingrese email y contraseña';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful, fetching user details...');
        // Fetch current user info after successful login
        this.authService.fetchCurrentUser().subscribe({
          next: (user) => {
            if (user) {
              console.log('User details fetched successfully', user);
              this.authService.setCurrentUser(user);
              
              // Small timeout to ensure storage is settled before guard checks it on navigation
              setTimeout(() => {
                console.log('Navigating to:', this.returnUrl);
                this.router.navigateByUrl(this.returnUrl);
              }, 100);
            } else {
              console.warn('Login succeeded but fetchCurrentUser returned null/empty');
              this.router.navigateByUrl(this.returnUrl);
            }
          },
          error: (err) => {
            console.error('Failed to fetch user after login', err);
            this.router.navigateByUrl(this.returnUrl);
          }
        });
      },
      error: (error) => {
        console.error('Login failed at component level', error);
        this.error = error.error?.detail || error.message || 'Error de autenticación';
        this.loading = false;
      }
    });
  }
}
