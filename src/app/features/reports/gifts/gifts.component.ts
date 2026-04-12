import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-gifts-report',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="Gift Transactions" description="Peer-to-peer gift analytics, claimed vs unclaimed" iconText="G" iconBgClass="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Gifts" [value]="fN(allData.length)" delta="+18%" icon="G" iconBgClass="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" sparklineColor="bg-pink-400" />
        <app-kpi-card label="Claimed" [value]="fN(claimed)" delta="+22%" icon="C" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Unclaimed" [value]="fN(unclaimed)" icon="U" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
        <app-kpi-card label="Total Gift Value" [value]="fC(totalValue)" delta="+15%" icon="V" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
      </div>
      <div class="card p-3"><div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-xs"><svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input [(ngModel)]="search" (ngModelChange)="page=1" class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40" placeholder="Search..." /></div>
        <select [(ngModel)]="claimFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[130px]"><option value="">All</option><option value="1">Claimed</option><option value="0">Unclaimed</option></select>
        <select [(ngModel)]="metalFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[120px]"><option value="">All Metals</option><option value="gold">Gold</option><option value="silver">Silver</option></select>
        <app-export-button [data]="expD()" filename="gifts" title="Gift Report" />
      </div></div>
      <div class="space-y-2">
        @for (g of pag(); track g.id; let i = $index) {
          <div class="card p-4 animate-fade-in-up" [style.animation-delay.ms]="i*25"><div class="flex items-center gap-0">
            <div class="w-[100px] flex-shrink-0 text-center"><div class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ g.senderUID }}</div><div class="text-[10px] text-slate-400">Sender</div></div>
            <div class="w-[30px] flex-shrink-0 text-center text-slate-400"><svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></div>
            <div class="w-[100px] flex-shrink-0 text-center"><div class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ g.receiverUID }}</div><div class="text-[10px] text-slate-400">Receiver</div></div>
            <div class="w-[90px] text-center flex-shrink-0"><div class="text-sm font-bold text-slate-800 dark:text-white">{{ fC(g.amount) }}</div></div>
            <div class="w-[80px] text-center flex-shrink-0"><span class="badge text-[10px]" [ngClass]="g.metalType==='gold'?'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400':'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">{{ g.metalType }}</span></div>
            <div class="flex-1 px-3 min-w-0"><div class="text-[12px] text-slate-600 dark:text-slate-300 truncate italic">"{{ g.giftMessage }}"</div></div>
            <div class="w-[80px] text-center flex-shrink-0"><span class="badge text-[10px]" [ngClass]="g.isClaimed?'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400':'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'">{{ g.isClaimed ? 'Claimed' : 'Pending' }}</span></div>
            <div class="w-[90px] text-center flex-shrink-0"><div class="text-[11px] text-slate-500">{{ fD(g.ts) }}</div></div>
          </div></div>
        }
      </div>
      @if (fil().length>pageSize){<div class="flex items-center justify-between text-sm"><span class="text-xs text-slate-400">{{ (page-1)*pageSize+1 }}-{{ min(page*pageSize,fil().length) }} of {{ fil().length }}</span><div class="flex gap-1"><button (click)="page=page-1" [disabled]="page===1" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button><button (click)="page=page+1" [disabled]="page>=Math.ceil(fil().length/pageSize)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button></div></div>}
    </div>
  `
})
export class GiftsComponent implements OnInit {
  private api = inject(ApiService);
  allData: any[] = []; search=''; claimFilter=''; metalFilter=''; page=1; pageSize=20; Math=Math;
  claimed=0; unclaimed=0; totalValue=0;

  ngOnInit() {
    forkJoin({
      kpis: this.api.giftsKpis(),
      list: this.api.giftsList({ pageSize: 100 })
    }).subscribe({
      next: (res) => {
        const list = res.list || [];
        this.allData = list.map((g: any) => ({
          ...g,
          senderUID: g.senderuid,
          receiverUID: g.receiveruid,
          isClaimed: g.isclaimed
        }));
        const kpis = res.kpis || {};
        this.claimed = kpis.claimed || 0;
        this.unclaimed = kpis.unclaimed || 0;
        this.totalValue = kpis.totalGiftValue || 0;
      },
      error: () => {
        this.allData = [];
      }
    });
  }

  fil = computed(() => { let d = this.allData; const q = this.search.toLowerCase();
    if (q) d = d.filter((g: any) => String(g.senderUID).includes(q) || String(g.receiverUID).includes(q) || g.giftMessage?.toLowerCase().includes(q));
    if (this.claimFilter) d = d.filter((g: any) => String(g.isClaimed) === this.claimFilter);
    if (this.metalFilter) d = d.filter((g: any) => g.metalType === this.metalFilter); return d; });
  pag = computed(() => this.fil().slice((this.page-1)*this.pageSize, this.page*this.pageSize));
  expD = computed(() => this.fil().map((g: any) => ({...g})) as Record<string, unknown>[]);
  min(a: number, b: number) { return Math.min(a, b); }
  fN(n: number) { return new Intl.NumberFormat('en-IN').format(n); }
  fC(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
  fD(d: string) { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return d; } }
}
