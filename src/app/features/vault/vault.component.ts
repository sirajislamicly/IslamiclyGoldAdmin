import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Vault</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card bg-gradient-to-br from-gold-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div class="text-4xl">🪙</div>
          <div class="mt-3 text-sm text-slate-500">Total Gold Holdings</div>
          <div class="text-3xl font-bold text-gold-600">{{ gold() | number }} g</div>
        </div>
        <div class="card bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-800">
          <div class="text-4xl">⚪</div>
          <div class="mt-3 text-sm text-slate-500">Total Silver Holdings</div>
          <div class="text-3xl font-bold text-silver-600">{{ silver() | number }} g</div>
        </div>
        <div class="card bg-gradient-to-br from-green-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div class="text-4xl">💰</div>
          <div class="mt-3 text-sm text-slate-500">Total Vault Value</div>
          <div class="text-3xl font-bold text-green-600">{{ value() | currency:'USD' }}</div>
        </div>
      </div>
    </div>
  `
})
export class VaultComponent {
  gold = signal(38214);
  silver = signal(92550);
  value = signal(4_287_650);
}
