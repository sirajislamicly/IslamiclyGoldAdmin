import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Settings</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your profile and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card">
            <div class="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700/40">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg">
                {{ initials() }}
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-800 dark:text-white">Profile Settings</h2>
                <p class="text-xs text-slate-400">Update your personal information</p>
              </div>
            </div>
            <form [formGroup]="profile" (ngSubmit)="saveProfile()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200" formControlName="name" />
                </div>
                <div>
                  <label class="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200" formControlName="email" type="email" />
                </div>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn-primary btn-ripple">Save Changes</button>
              </div>
            </form>
          </div>

          <div class="card">
            <div class="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700/40">
              <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-800 dark:text-white">Security</h2>
                <p class="text-xs text-slate-400">Update your password</p>
              </div>
            </div>
            <form [formGroup]="password" (ngSubmit)="savePassword()" class="space-y-4">
              <div>
                <label class="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                <input class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200" type="password" formControlName="current" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200" type="password" formControlName="next" />
                </div>
                <div>
                  <label class="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <input class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200" type="password" formControlName="confirm" />
                </div>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn-primary btn-ripple">Update Password</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-6">
          <div class="card text-center">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
              {{ initials() }}
            </div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{ auth.currentUser()?.name || 'Admin' }}</h3>
            <p class="text-sm text-slate-400">{{ auth.currentUser()?.email }}</p>
            <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/40">
              <span class="badge bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">{{ auth.currentUser()?.role || 'administrator' }}</span>
            </div>
          </div>

          <div class="card">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Quick Info</h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between"><span class="text-slate-400">Platform</span><span class="font-medium text-slate-700 dark:text-slate-200">GoldAdmin v1.0</span></div>
              <div class="flex items-center justify-between"><span class="text-slate-400">Angular</span><span class="font-medium text-slate-700 dark:text-slate-200">v17.3</span></div>
              <div class="flex items-center justify-between"><span class="text-slate-400">Theme</span><span class="font-medium text-slate-700 dark:text-slate-200">Auto</span></div>
              <div class="flex items-center justify-between"><span class="text-slate-400">Timezone</span><span class="font-medium text-slate-700 dark:text-slate-200">IST (UTC+5:30)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  profile = this.fb.nonNullable.group({
    name: [this.auth.currentUser()?.name || '', Validators.required],
    email: [this.auth.currentUser()?.email || '', [Validators.required, Validators.email]]
  });

  password = this.fb.nonNullable.group({
    current: ['', Validators.required],
    next: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  });

  initials(): string {
    const name = this.auth.currentUser()?.name || 'A';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  saveProfile(): void {
    this.toast.success('Profile updated successfully!');
  }

  savePassword(): void {
    if (this.password.getRawValue().next !== this.password.getRawValue().confirm) {
      this.toast.error('Passwords do not match!');
      return;
    }
    this.toast.success('Password updated successfully!');
    this.password.reset();
  }
}
