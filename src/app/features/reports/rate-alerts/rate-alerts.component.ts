import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-rate-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="Rate Alerts" description="Price alert monitoring, notification status, and engagement" iconText="A" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Alerts" [value]="fN(allData.length)" delta="+25%" icon="A" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Gold Alerts" [value]="fN(goldAlerts)" icon="Au" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
        <app-kpi-card label="Silver Alerts" [value]="fN(silverAlerts)" icon="Ag" iconBgClass="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" sparklineColor="bg-slate-400" />
        <app-kpi-card label="App Notifications" [value]="fN(appNotif)" icon="N" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
      </div>
      <div class="card p-3"><div class="flex items-center gap-3">
        <select [(ngModel)]="metalFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[120px]"><option value="">All Metals</option><option value="GOLD">Gold</option><option value="SILVER">Silver</option></select>
        <select [(ngModel)]="notifFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[150px]"><option value="">All Notifications</option><option value="app">App Enabled</option><option value="email">Email Enabled</option><option value="both">Both Enabled</option></select>
        <div class="flex-1"></div>
        <app-export-button [data]="expD()" filename="rate-alerts" title="Rate Alerts Report" />
      </div></div>
      <div class="space-y-2">
        @for (a of pag(); track a.rateId; let i = $index) {
          <div class="card p-4 animate-fade-in-up" [style.animation-delay.ms]="i*25"><div class="flex items-center gap-0">
            <div class="w-[80px] flex-shrink-0 text-center"><span class="badge text-[10px]" [ngClass]="a.metalType==='GOLD'?'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400':'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">{{ a.metalType }}</span></div>
            <div class="w-[120px] text-center flex-shrink-0"><div class="text-sm font-bold text-slate-800 dark:text-white">{{ fC(a.price) }}</div><div class="text-[10px] text-slate-400">Target Price</div></div>
            <div class="w-[140px] flex-shrink-0"><div class="text-[12px] text-slate-600 dark:text-slate-300 font-mono truncate">{{ a.augUserId | slice:0:16 }}...</div></div>
            <div class="flex-1 px-4 flex items-center gap-4">
              <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" [ngClass]="a.appNotification?'bg-emerald-500':'bg-slate-300'"></span><span class="text-[11px] text-slate-500">App</span></div>
              <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" [ngClass]="a.emailNotification?'bg-emerald-500':'bg-slate-300'"></span><span class="text-[11px] text-slate-500">Email</span></div>
            </div>
            <div class="w-[90px] text-center flex-shrink-0"><span class="badge text-[10px]" [ngClass]="a.status?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'">{{ a.status ? 'Active' : 'Inactive' }}</span></div>
            <div class="w-[90px] text-center flex-shrink-0"><div class="text-[11px] text-slate-500">{{ fD(a.createDate) }}</div></div>
          </div></div>
        }
      </div>
    </div>
  `
})
export class RateAlertsComponent implements OnInit {
  private api = inject(ApiService);
  allData: any[] = []; metalFilter=''; notifFilter=''; page=1; pageSize=20; Math=Math;
  goldAlerts=0; silverAlerts=0; appNotif=0;
  ngOnInit() {
    forkJoin({
      kpis: this.api.rateAlertsKpis(),
      list: this.api.rateAlertsList({ pageSize: 100 })
    }).subscribe({
      next: (res) => {
        const list = res.list || [];
        this.allData = list.map((r: any) => ({
          ...r,
          rateId: r.rateid,
          augUserId: r.auguserid
        }));
        const kpis = res.kpis || {};
        this.goldAlerts = kpis.goldAlerts || 0;
        this.silverAlerts = kpis.silverAlerts || 0;
        this.appNotif = kpis.appNotifications || 0;
      },
      error: () => {
        this.allData = [];
      }
    });
  }
  fil = computed(() => { let d = this.allData;
    if (this.metalFilter) d = d.filter((a: any) => a.metalType === this.metalFilter);
    if (this.notifFilter === 'app') d = d.filter((a: any) => a.appNotification);
    else if (this.notifFilter === 'email') d = d.filter((a: any) => a.emailNotification);
    else if (this.notifFilter === 'both') d = d.filter((a: any) => a.appNotification && a.emailNotification);
    return d; });
  pag = computed(() => this.fil().slice((this.page-1)*this.pageSize, this.page*this.pageSize));
  expD = computed(() => this.fil().map((a: any) => ({...a})) as Record<string, unknown>[]);
  fN(n: number) { return new Intl.NumberFormat('en-IN').format(n); }
  fC(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
  fD(d: string) { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return d; } }
}
