import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-web-mobile-report',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="Web vs Mobile" description="Platform-wise transaction split and volume comparison" iconText="W" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Mobile Transactions" [value]="fN(mobileTxns)" delta="+15%" icon="M" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Web Transactions" [value]="fN(webTxns)" delta="+8%" icon="W" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
        <app-kpi-card label="Mobile Volume" [value]="fC(mobileVol)" icon="V" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Web Volume" [value]="fC(webVol)" icon="V" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
      </div>

      <!-- Platform Split -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Donut -->
        <div class="card">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Transaction Split by Platform</h3>
          <div class="flex items-center gap-8">
            <div class="relative w-36 h-36 flex-shrink-0">
              <svg class="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-100 dark:text-slate-700"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" stroke-width="3" [attr.stroke-dasharray]="mobilePct + ' ' + (100-mobilePct)" stroke-dashoffset="0" stroke-linecap="round"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" stroke-width="3" [attr.stroke-dasharray]="webPct + ' ' + (100-webPct)" [attr.stroke-dashoffset]="-mobilePct" stroke-linecap="round"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-[10px] text-slate-400">Total</span><span class="text-lg font-bold text-slate-800 dark:text-white">{{ fN(mobileTxns+webTxns) }}</span></div>
            </div>
            <div class="space-y-4 flex-1">
              <div><div class="flex items-center justify-between"><span class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><span class="w-3 h-3 rounded-full bg-blue-500"></span> Mobile</span><span class="text-sm font-bold">{{ mobilePct }}%</span></div>
                <div class="mt-1.5 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-blue-500 rounded-full" [style.width.%]="mobilePct"></div></div><div class="text-[11px] text-slate-400 mt-1">{{ fN(mobileTxns) }} transactions &middot; {{ fC(mobileVol) }}</div></div>
              <div><div class="flex items-center justify-between"><span class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><span class="w-3 h-3 rounded-full bg-violet-500"></span> Web</span><span class="text-sm font-bold">{{ webPct }}%</span></div>
                <div class="mt-1.5 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-violet-500 rounded-full" [style.width.%]="webPct"></div></div><div class="text-[11px] text-slate-400 mt-1">{{ fN(webTxns) }} transactions &middot; {{ fC(webVol) }}</div></div>
            </div>
          </div>
        </div>

        <!-- Breakdown Table -->
        <div class="card">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Platform Breakdown by Type</h3>
          <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table class="w-full text-sm">
              <thead><tr class="bg-slate-50 dark:bg-slate-800/50"><th class="py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase">Type</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">Mobile</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">Web</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">Mobile %</th></tr></thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                @for (r of breakdown; track r.type) {
                  <tr class="hover:bg-gold-50/30"><td class="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">{{ r.type }}</td><td class="py-3 px-4 text-right font-bold">{{ fN(r.mobile) }}</td><td class="py-3 px-4 text-right">{{ fN(r.web) }}</td><td class="py-3 px-4 text-right"><span class="text-blue-600 font-bold">{{ r.mobilePct }}%</span></td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WebMobileComponent implements OnInit {
  private api = inject(ApiService);
  mobileTxns=0; webTxns=0; mobileVol=0; webVol=0; mobilePct=0; webPct=0;
  breakdown: {type:string;mobile:number;web:number;mobilePct:number}[] = [];

  ngOnInit() {
    this.api.webMobilePlatformSplit().subscribe({
      next: (res) => {
        const list = res || [];
        this.mobileTxns = list.reduce((s: number, r: any) => s + (r.mobileCount || 0), 0);
        this.webTxns = list.reduce((s: number, r: any) => s + (r.webCount || 0), 0);
        this.mobileVol = list.reduce((s: number, r: any) => s + (r.mobileVolume || 0), 0);
        this.webVol = list.reduce((s: number, r: any) => s + (r.webVolume || 0), 0);
        const total = this.mobileTxns + this.webTxns || 1;
        this.mobilePct = Math.round((this.mobileTxns / total) * 100);
        this.webPct = 100 - this.mobilePct;
        this.breakdown = list.map((r: any) => ({
          type: r.transactionType,
          mobile: r.mobileCount || 0,
          web: r.webCount || 0,
          mobilePct: Math.round(((r.mobileCount || 0) / ((r.mobileCount || 0) + (r.webCount || 0) || 1)) * 100)
        }));
      },
      error: () => {
        this.breakdown = [];
      }
    });
  }
  fN(n:number){return new Intl.NumberFormat('en-IN').format(n);}
  fC(n:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);}
}
