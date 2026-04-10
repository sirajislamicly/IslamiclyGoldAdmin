import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div class="card w-full max-w-md">
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">🪙</div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Gold Admin Panel</h1>
          <p class="text-slate-500 text-sm mt-1">Sign in to continue</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" formControlName="email" class="input" placeholder="admin@islamicly.gold" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input type="password" formControlName="password" class="input" placeholder="••••••••" />
          </div>

          <button type="submit" class="btn-primary w-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: [''],
    password: ['']
  });

  submit() {
    localStorage.setItem('gold_admin_token', 'dev-token');
    localStorage.setItem('gold_admin_user', JSON.stringify({ id: '1', name: 'Admin', email: 'admin@islamicly.gold', role: 'admin' }));
    this.router.navigate(['/dashboard']);
  }
}
