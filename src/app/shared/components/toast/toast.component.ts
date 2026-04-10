import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-xl animate-slide-in-right"
             [ngClass]="toastClasses[toast.type]">
          <!-- Icon -->
          <div class="flex-shrink-0">
            @switch (toast.type) {
              @case ('success') {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              }
              @case ('error') {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
              }
              @case ('warning') {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
              }
              @default {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
              }
            }
          </div>
          <!-- Message -->
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <!-- Dismiss -->
          <button (click)="toastService.dismiss(toast.id)" class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <!-- Progress bar -->
          <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
            <div class="h-full opacity-30 animate-progress"
                 [ngClass]="progressClasses[toast.type]"
                 [style.animation-duration.ms]="toast.duration || 4000"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
    .animate-progress {
      animation: progress linear forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClasses: Record<string, string> = {
    success: 'bg-emerald-50/95 dark:bg-emerald-900/90 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300',
    error: 'bg-red-50/95 dark:bg-red-900/90 border-red-200/60 dark:border-red-800/40 text-red-700 dark:text-red-300',
    warning: 'bg-amber-50/95 dark:bg-amber-900/90 border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-300',
    info: 'bg-blue-50/95 dark:bg-blue-900/90 border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300'
  };

  progressClasses: Record<string, string> = {
    success: 'bg-emerald-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500'
  };
}
