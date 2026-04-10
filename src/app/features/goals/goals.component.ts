import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Goal } from './goal.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Goals</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let g of goals()" class="card">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-slate-800 dark:text-white">{{ g.name }}</h3>
              <p class="text-sm text-slate-500">{{ g.user }}</p>
            </div>
            <span class="text-gold-600 font-bold">{{ progress(g) }}%</span>
          </div>
          <div class="mt-4 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gold-500 transition-all" [style.width.%]="progress(g)"></div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-slate-500">
            <span>{{ g.currentAmount | currency:'USD' }}</span>
            <span>{{ g.targetAmount | currency:'USD' }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GoalsComponent {
  goals = signal<Goal[]>([
    { id: 'G1', name: 'Hajj Savings',    user: 'Ayesha K.', targetAmount: 8000, currentAmount: 5200 },
    { id: 'G2', name: 'Wedding Gold',    user: 'Omar R.',   targetAmount: 5000, currentAmount: 1800 },
    { id: 'G3', name: 'Emergency Fund',  user: 'Fatima S.', targetAmount: 3000, currentAmount: 2850 },
    { id: 'G4', name: 'Child Education', user: 'Yusuf A.',  targetAmount: 15000, currentAmount: 4200 }
  ]);

  progress(g: Goal): number {
    return Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
  }
}
