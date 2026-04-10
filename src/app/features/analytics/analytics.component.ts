import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Revenue Trends</h2>
          <div class="h-56 flex items-end gap-2">
            <div *ngFor="let v of revenue; let i = index" class="flex-1 bg-green-500 rounded-t" [style.height.%]="v">
              <div class="text-xs text-center text-white mt-1">{{ months[i] }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold mb-4">User Growth</h2>
          <div class="h-56 flex items-end gap-2">
            <div *ngFor="let v of users; let i = index" class="flex-1 bg-blue-500 rounded-t" [style.height.%]="v">
              <div class="text-xs text-center text-white mt-1">{{ months[i] }}</div>
            </div>
          </div>
        </div>

        <div class="card lg:col-span-2">
          <h2 class="text-lg font-semibold mb-4">Metal Trends</h2>
          <div class="h-56 flex items-end gap-2">
            <div *ngFor="let b of metalBars; let i = index" class="flex-1 flex flex-col gap-1">
              <div class="bg-gold-500 rounded-t" [style.height.%]="b.gold"></div>
              <div class="bg-silver-500 rounded-t" [style.height.%]="b.silver"></div>
              <div class="text-xs text-center text-slate-500">{{ months[i] }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  revenue = this.months.map(() => 30 + Math.random() * 60);
  users = this.months.map(() => 25 + Math.random() * 65);
  metalBars = this.months.map(() => ({ gold: 20 + Math.random() * 60, silver: 10 + Math.random() * 50 }));
}
