import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Profile</h2>
          <form [formGroup]="profile" class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <input class="input" formControlName="name" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input class="input" formControlName="email" type="email" />
            </div>
            <button type="submit" class="btn-primary">Save Profile</button>
          </form>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Change Password</h2>
          <form [formGroup]="password" class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">Current Password</label>
              <input class="input" type="password" formControlName="current" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">New Password</label>
              <input class="input" type="password" formControlName="next" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Confirm New Password</label>
              <input class="input" type="password" formControlName="confirm" />
            </div>
            <button type="submit" class="btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  profile = this.fb.nonNullable.group({
    name: [this.auth.currentUser()?.name || '', Validators.required],
    email: [this.auth.currentUser()?.email || '', [Validators.required, Validators.email]]
  });

  password = this.fb.nonNullable.group({
    current: ['', Validators.required],
    next: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  });
}
