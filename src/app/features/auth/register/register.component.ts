import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Create Account</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" />
          <span class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
            Valid email is required.
          </span>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" autocomplete="new-password" />
          <span class="error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
            Password must be at least 12 characters.
          </span>
        </div>
        <span class="error" *ngIf="errorMessage">{{ errorMessage }}</span>
        <button type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Creating account…' : 'Register' }}
        </button>
      </form>
      <p>Already have an account? <a routerLink="/login">Sign in</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 80px auto; padding: 2rem; }
    .field { display: flex; flex-direction: column; margin-bottom: 1rem; }
    .error { color: #d32f2f; font-size: 0.85rem; margin-top: 0.25rem; }
    button { width: 100%; padding: 0.75rem; margin-top: 1rem; }
  `]
})
export class RegisterComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]]
  });
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.value;
    this.authService.register(email!, password!).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.status === 409
          ? 'Email already registered.'
          : 'Registration failed. Please try again.';
      }
    });
  }
}
