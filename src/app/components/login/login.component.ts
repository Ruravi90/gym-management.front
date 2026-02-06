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
        console.log('Login successful', response);
        // Fetch current user info after successful login
        this.authService.fetchCurrentUser().subscribe(user => {
          if (user) {
            this.authService.setCurrentUser(user);
          }
          // Navigate to return URL or default to dashboard
          this.router.navigate([this.returnUrl]);
        });
      },
      error: (error) => {
        console.error('Login failed', error);
        this.error = error.error?.detail || error.message || 'Error de autenticación';
        this.loading = false;
      }
    });
  }
}
