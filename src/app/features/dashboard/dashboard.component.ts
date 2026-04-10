import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard { label: string; value: string; delta: string; icon: string; color: string; }
interface Activity { user: string; action: string; time: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div *ngFor="let stat of stats" class="card">
          <div class="flex items-center justify-between">
            <span class="text-2xl">{{ stat.icon }}</span>
            <span class="text-xs font-medium" [class]="stat.color">{{ stat.delta }}</span>
          </div>
          <div class="mt-3">
            <div class="text-sm text-slate-500">{{ stat.label }}</div>
            <div class="text-2xl font-bold text-slate-800 dark:text-white mt-1">{{ stat.value }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="card lg:col-span-2">
          <h2 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Gold vs Silver Trend</h2>
          <div class="h-64 flex items-end gap-2">
            <div *ngFor="let b of bars; let i = index" class="flex-1 flex flex-col gap-1">
              <div class="bg-gold-500 rounded-t" [style.height.%]="b.gold"></div>
              <div class="bg-silver-500 rounded-t" [style.height.%]="b.silver"></div>
              <div class="text-xs text-center text-slate-500">{{ months[i] }}</div>
            </div>
          </div>
          <div class="flex gap-4 mt-4 text-sm">
            <span class="flex items-center gap-1"><span class="w-3 h-3 bg-gold-500 rounded"></span> Gold</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 bg-silver-500 rounded"></span> Silver</span>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Recent Activity</h2>
          <ul class="space-y-3">
            <li *ngFor="let a of activity" class="flex items-start gap-3 text-sm">
              <div class="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center font-semibold">
                {{ a.user[0] }}
              </div>
              <div class="flex-1">
                <div class="text-slate-700 dark:text-slate-200"><strong>{{ a.user }}</strong> {{ a.action }}</div>
                <div class="text-xs text-slate-400">{{ a.time }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  stats: StatCard[] = [
    { label: 'Total Users',        value: '12,486', delta: '+4.2%',  icon: '👥', color: 'text-green-600' },
    { label: 'Total Gold (g)',     value: '38,214', delta: '+2.1%',  icon: '🪙', color: 'text-green-600' },
    { label: 'Total Silver (g)',   value: '92,550', delta: '-0.8%',  icon: '⚪', color: 'text-red-600'   },
    { label: 'Transactions',       value: '48,921', delta: '+8.4%',  icon: '💳', color: 'text-green-600' },
    { label: 'Revenue (USD)',      value: '$284k',  delta: '+12.3%', icon: '💰', color: 'text-green-600' }
  ];

  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
  bars = this.months.map(() => ({ gold: 20 + Math.random() * 70, silver: 10 + Math.random() * 60 }));

  activity: Activity[] = [
    { user: 'Ayesha K.',  action: 'bought 5g gold',       time: '2 min ago'  },
    { user: 'Omar R.',    action: 'sold 10g silver',      time: '14 min ago' },
    { user: 'Fatima S.',  action: 'completed KYC',        time: '1 hr ago'   },
    { user: 'Yusuf A.',   action: 'created goal "Hajj"',  time: '3 hr ago'   }
  ];
}
