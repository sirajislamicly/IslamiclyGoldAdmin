import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

interface StateData { state:string; users:number; buyVol:number; sellVol:number; pct:number; }

@Component({
  selector: 'app-geography-report',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, ExportButtonComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="User Geography" description="State-wise user distribution and regional transaction volume" iconText="G" iconBgClass="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" />

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
  private api = inject(ApiService);
  stateData: StateData[] = []; topState=''; totalUsers=0; avgPerState=0; expD: Record<string,unknown>[] = [];

  ngOnInit() {
    this.api.geographyStateWise().subscribe({
      next: (res) => {
        const list = res || [];
        this.stateData = list.map((s: any) => ({
          state: s.state,
          users: s.userCount,
          buyVol: s.buyVolume,
          sellVol: s.sellVolume,
          pct: Math.round(s.percentage)
        }));
        this.totalUsers = this.stateData.reduce((s, d) => s + d.users, 0);
        this.topState = this.stateData[0]?.state || '-';
        this.avgPerState = Math.round(this.totalUsers / (this.stateData.length || 1));
        this.expD = this.stateData.map(s => ({ ...s }));
      },
      error: () => {
        this.stateData = [];
        this.expD = [];
      }
    });
  }
  fN(n:number){return new Intl.NumberFormat('en-IN').format(n);}
  fC(n:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);}
}
