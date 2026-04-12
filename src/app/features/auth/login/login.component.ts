import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Confetti -->
    @if (showConfetti()) {
      <div class="confetti-container">
        @for (c of confettiPieces; track c.id) {
          <div class="confetti-piece"
               [style.left.%]="c.x"
               [style.background]="c.color"
               [style.animation-delay.ms]="c.delay"
               [style.animation-duration.s]="c.duration"></div>
        }
      </div>
    }

    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Animated Gradient Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
      <div class="absolute inset-0 opacity-30 dark:opacity-10"
           style="background: radial-gradient(circle at 20% 50%, rgba(245,158,11,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(251,191,36,0.2) 0%, transparent 50%),
                  radial-gradient(circle at 60% 80%, rgba(217,119,6,0.2) 0%, transparent 50%);">
      </div>

      <!-- Floating Orbs -->
      <div class="absolute w-64 h-64 bg-gradient-to-br from-amber-300/20 to-orange-400/20 rounded-full blur-3xl animate-float" style="top: 10%; left: 15%;"></div>
      <div class="absolute w-80 h-80 bg-gradient-to-br from-yellow-300/15 to-amber-400/15 rounded-full blur-3xl animate-float" style="bottom: 10%; right: 10%; animation-delay: 2s;"></div>

      <!-- Login Card -->
      <div class="card-glass w-full max-w-md relative z-10 animate-fade-in-up">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-[72px] h-[72px] bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/25 animate-float ring-4 ring-amber-400/10" style="animation-duration: 4s;">
            <svg class="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-3.13 9.37-7 10.75-3.87-1.38-7-5.92-7-10.75V6.3l7-3.12zM10 12l-2-2-1.41 1.41L10 14.82l7.41-7.41L16 6l-6 6z"/>
            </svg>
          </div>
          <h1 class="text-[26px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
            <span class="text-gradient-gold">Gold</span>Admin
          </h1>
          <p class="text-slate-400 dark:text-slate-500 text-[13px] mt-1.5 font-medium tracking-wide uppercase">
            by Islamicly
          </p>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-3">
            {{ auth.otpSent() ? 'Enter the verification code sent to your email' : 'Sign in to access your dashboard' }}
          </p>
        </div>

        <!-- Error -->
        @if (auth.error()) {
          <div class="mb-5 p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-fade-in">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
            {{ auth.error() }}
          </div>
        }

        <!-- Success -->
        @if (successMessage()) {
          <div class="mb-5 p-3 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            {{ successMessage() }}
          </div>
        }

        <!-- Email Step -->
        @if (!auth.otpSent()) {
          <form [formGroup]="emailForm" (ngSubmit)="sendOtp()" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div class="relative">
                <input type="email"
                       formControlName="email"
                       class="input !pl-12 py-3"
                       placeholder="admin@islamicly.com"
                       [class.border-red-400]="emailForm.controls.email.touched && emailForm.controls.email.invalid" />
                <svg class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
              </div>
              @if (emailForm.controls.email.touched && emailForm.controls.email.hasError('email')) {
                <p class="text-red-500 text-xs mt-1.5 animate-fade-in">Please enter a valid email address</p>
              }
            </div>

            <button type="submit"
                    [disabled]="emailForm.invalid || auth.loading()"
                    class="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[15px]">
              @if (auth.loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Sending OTP...
              } @else {
                Send Verification Code
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              }
            </button>
          </form>
        }

        <!-- OTP Step -->
        @if (auth.otpSent()) {
          <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()" class="space-y-5 animate-fade-in-up">
            <div class="text-center mb-1">
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-50 dark:bg-gold-900/20 rounded-full">
                <svg class="w-3.5 h-3.5 text-gold-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm1.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 12.11 4.555 8.835z" clip-rule="evenodd"/></svg>
                <span class="text-xs font-semibold text-gold-700 dark:text-gold-400">{{ auth.otpEmail() }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Verification Code</label>
              <div class="flex gap-2.5 justify-center">
                @for (i of otpSlots; track i) {
                  <input type="text"
                         maxlength="1"
                         inputmode="numeric"
                         pattern="[0-9]"
                         class="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/60 rounded-xl
                                focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500
                                transition-all duration-200 text-slate-800 dark:text-white"
                         (input)="onOtpInput($event, i)"
                         (keydown)="onOtpKeydown($event, i)"
                         (paste)="onOtpPaste($event)"
                         [attr.data-otp-index]="i" />
                }
              </div>
            </div>

            <div class="flex items-center justify-between text-sm px-1">
              <span class="text-slate-400 text-xs font-medium">
                @if (countdown() > 0) {
                  Expires in <span class="text-slate-600 dark:text-slate-300 font-bold counter-value">{{ formatCountdown(countdown()) }}</span>
                } @else {
                  <span class="text-red-500">Code expired</span>
                }
              </span>
              <button type="button"
                      (click)="resendOtp()"
                      [disabled]="!auth.canResendOtp() || auth.loading()"
                      class="text-gold-600 hover:text-gold-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Resend code
              </button>
            </div>

            <button type="submit"
                    [disabled]="otpForm.invalid || auth.loading()"
                    class="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[15px]">
              @if (auth.loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Verifying...
              } @else {
                Sign In
              }
            </button>

            <button type="button"
                    (click)="goBack()"
                    class="w-full text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Different email
            </button>
          </form>
        }

        <div class="mt-8 pt-5 border-t border-slate-200/40 dark:border-slate-700/40">
          <div class="flex items-center justify-center gap-1.5 mb-1.5">
            <svg class="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/></svg>
            <span class="text-[11px] text-slate-400 font-medium">Secured with OTP verification</span>
          </div>
          <p class="text-[10px] text-center text-slate-400/70">
            &copy; {{ currentYear }} Islamicly. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnDestroy {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ToastService);

  currentYear = new Date().getFullYear();
  showConfetti = signal(false);
  confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#f59e0b', '#d97706', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 7)],
    delay: Math.random() * 500,
    duration: 1.5 + Math.random() * 1.5
  }));

  otpSlots = [0, 1, 2, 3, 4, 5];
  emailForm = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  otpForm = this.fb.nonNullable.group({ otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]] });

  successMessage = signal('');
  countdown = signal(300);
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  sendOtp(): void {
    if (this.emailForm.invalid) return;
    this.auth.sendOtp(this.emailForm.getRawValue().email).subscribe({
      next: (res) => { if (res.success) { this.successMessage.set(res.message); this.startCountdown(res.expiresIn); setTimeout(() => this.successMessage.set(''), 3000); } }
    });
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) return;
    this.auth.verifyOtp(this.auth.otpEmail(), this.otpForm.getRawValue().otp).subscribe({
      next: (res) => {
        if (res.success) {
          this.showConfetti.set(true);
          this.toast.success('Welcome back! Logged in successfully.');
          setTimeout(() => this.router.navigate(['/dashboard']), 1200);
        }
      }
    });
  }

  resendOtp(): void {
    this.auth.resendOtp().subscribe({
      next: (res) => { if (res.success) { this.successMessage.set('Code resent!'); this.startCountdown(300); setTimeout(() => this.successMessage.set(''), 3000); } }
    });
  }

  goBack(): void { this.auth.otpSent.set(false); this.auth.error.set(''); this.successMessage.set(''); this.stopCountdown(); }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 5) { (document.querySelector(`[data-otp-index="${index + 1}"]`) as HTMLInputElement)?.focus(); }
    this.updateOtpValue();
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !(event.target as HTMLInputElement).value && index > 0) {
      (document.querySelector(`[data-otp-index="${index - 1}"]`) as HTMLInputElement)?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text')?.trim() || '';
    if (!/^\d{6}$/.test(paste)) return;
    paste.split('').forEach((char, i) => { const el = document.querySelector(`[data-otp-index="${i}"]`) as HTMLInputElement; if (el) el.value = char; });
    this.updateOtpValue();
    (document.querySelector(`[data-otp-index="5"]`) as HTMLInputElement)?.focus();
  }

  private updateOtpValue(): void {
    let otp = '';
    for (let i = 0; i < 6; i++) { otp += (document.querySelector(`[data-otp-index="${i}"]`) as HTMLInputElement)?.value || ''; }
    this.otpForm.controls.otp.setValue(otp);
  }

  private startCountdown(seconds: number): void {
    this.stopCountdown();
    this.countdown.set(seconds);
    this.countdownInterval = setInterval(() => { const c = this.countdown(); if (c <= 0) this.stopCountdown(); else this.countdown.set(c - 1); }, 1000);
  }

  private stopCountdown(): void { if (this.countdownInterval) { clearInterval(this.countdownInterval); this.countdownInterval = null; } }
  ngOnDestroy(): void { this.stopCountdown(); }
}
