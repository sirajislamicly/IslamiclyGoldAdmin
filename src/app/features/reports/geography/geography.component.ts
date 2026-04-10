import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { MockDataService } from '../../../core/services/mock-data.service';

interface StateData { state:string; users:number; buyVol:number; sellVol:number; pct:number; }

@Component({
  selector: 'app-geography-report',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, ExportButtonComponent],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="States Covered" [value]="fN(stateData.length)" icon="S" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Top State" [value]="topState" icon="T" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Total Users" [value]="fN(totalUsers)" delta="+4%" icon="U" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
        <app-kpi-card label="Avg Users/State" [value]="fN(avgPerState)" icon="A" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
      </div>

      <!-- State-wise breakdown -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">State-wise Distribution</h3>
          <app-export-button [data]="expD" filename="geography" title="Geography Report" />
        </div>
        <div class="space-y-3">
          @for (s of stateData; track s.state) {
            <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div class="w-[140px] text-sm font-semibold text-slate-700 dark:text-slate-200">{{ s.state }}</div>
              <div class="flex-1">
                <div class="flex items-center justify-between text-[11px] mb-1">
                  <span class="text-slate-500">{{ s.users }} users</span>
                  <span class="font-bold text-slate-700 dark:text-slate-200">{{ s.pct }}%</span>
                </div>
                <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-400 to-violet-500 rounded-full chart-bar-animated" [style.width.%]="s.pct"></div>
                </div>
              </div>
              <div class="w-[100px] text-right"><div class="text-xs font-bold text-emerald-600">{{ fC(s.buyVol) }}</div><div class="text-[10px] text-slate-400">Buy Vol</div></div>
              <div class="w-[100px] text-right"><div class="text-xs font-bold text-red-500">{{ fC(s.sellVol) }}</div><div class="text-[10px] text-slate-400">Sell Vol</div></div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class GeographyComponent implements OnInit {
  private mock = inject(MockDataService);
  stateData: StateData[] = []; topState=''; totalUsers=0; avgPerState=0; expD: Record<string,unknown>[] = [];

  ngOnInit() {
    const users = this.mock.getUsers(200);
    const buys = this.mock.getBuyTransactions(500);
    this.totalUsers = users.length;
    const stateMap = new Map<string,{users:number;buyVol:number;sellVol:number}>();
    users.forEach(u => {
      const s = u.userState || 'Unknown';
      const cur = stateMap.get(s) || {users:0,buyVol:0,sellVol:0};
      cur.users++;
      stateMap.set(s, cur);
    });
    buys.forEach(b => {
      const user = users.find(u => u.uniqueId === b.uniqueId);
      const s = user?.userState || 'Unknown';
      const cur = stateMap.get(s) || {users:0,buyVol:0,sellVol:0};
      cur.buyVol += b.totalAmount;
      stateMap.set(s, cur);
    });
    this.stateData = Array.from(stateMap.entries()).map(([state, d]) => ({
      state, ...d, pct: Math.round((d.users / this.totalUsers) * 100)
    })).sort((a, b) => b.users - a.users);
    this.topState = this.stateData[0]?.state || '-';
    this.avgPerState = Math.round(this.totalUsers / (this.stateData.length || 1));
    this.expD = this.stateData.map(s => ({...s}));
  }
  fN(n:number){return new Intl.NumberFormat('en-IN').format(n);}
  fC(n:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);}
}
