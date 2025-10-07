import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If user is already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onGetStarted(): void {
    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      // Show login/signup options
      this.router.navigate(['/login']);
    }
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }
}