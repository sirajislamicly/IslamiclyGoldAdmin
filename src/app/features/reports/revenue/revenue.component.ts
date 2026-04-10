import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-revenue-report',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Revenue & Commission</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Buy/sell revenue, GST collected, and spread analysis</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Buy Revenue" [value]="fC(totalBuyRev)" delta="+12%" icon="B" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Total Sell Payout" [value]="fC(totalSellPay)" delta="+8%" icon="S" iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" sparklineColor="bg-red-400" />
        <app-kpi-card label="GST Collected" [value]="fC(gstCollected)" delta="+10%" icon="G" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Net Spread Revenue" [value]="fC(spreadRev)" delta="+18%" icon="R" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
      </div>

      <!-- Monthly Revenue Chart -->
      <div class="card">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Monthly Revenue Trend</h3>
        <div class="h-56 flex items-end gap-1.5">
          @for (m of monthlyData; track m.month) {
            <div class="flex-1 flex flex-col items-center gap-0.5">
              <div class="w-full flex gap-[2px] items-end justify-center" style="height: 200px">
                <div class="w-[44%] bg-gradient-to-t from-emerald-600 to-emerald-300 rounded-t-md chart-bar chart-bar-animated" [style.height.%]="m.buyPct"></div>
                <div class="w-[44%] bg-gradient-to-t from-blue-600 to-blue-300 rounded-t-md chart-bar chart-bar-animated" [style.height.%]="m.gstPct"></div>
              </div>
              <div class="text-[10px] text-slate-400 font-medium mt-1">{{ m.month }}</div>
            </div>
          }
        </div>
        <div class="flex gap-6 mt-3 text-xs"><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Buy Revenue</span><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> GST</span></div>
      </div>

      <!-- Commission Table -->
      <div class="card">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Revenue Breakdown by Metal</h3>
        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table class="w-full text-sm">
            <thead><tr class="bg-slate-50 dark:bg-slate-800/50"><th class="py-3 px-4 text-left text-[11px] font-bold text-slate-400 uppercase">Metal</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">Buy Volume</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">Sell Volume</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">GST (3%)</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">Spread</th><th class="py-3 px-4 text-right text-[11px] font-bold text-slate-400 uppercase">Net Revenue</th></tr></thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr class="hover:bg-gold-50/30"><td class="py-3 px-4 font-semibold"><span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span> Gold</span></td><td class="py-3 px-4 text-right font-bold">{{ fC(goldBuyVol) }}</td><td class="py-3 px-4 text-right">{{ fC(goldSellVol) }}</td><td class="py-3 px-4 text-right text-blue-600">{{ fC(goldGst) }}</td><td class="py-3 px-4 text-right text-emerald-600">{{ fC(goldSpread) }}</td><td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-white">{{ fC(goldGst + goldSpread) }}</td></tr>
              <tr class="hover:bg-gold-50/30"><td class="py-3 px-4 font-semibold"><span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-slate-400"></span> Silver</span></td><td class="py-3 px-4 text-right font-bold">{{ fC(silverBuyVol) }}</td><td class="py-3 px-4 text-right">{{ fC(silverSellVol) }}</td><td class="py-3 px-4 text-right text-blue-600">{{ fC(silverGst) }}</td><td class="py-3 px-4 text-right text-emerald-600">{{ fC(silverSpread) }}</td><td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-white">{{ fC(silverGst + silverSpread) }}</td></tr>
              <tr class="bg-slate-50 dark:bg-slate-800/30 font-bold"><td class="py-3 px-4">Total</td><td class="py-3 px-4 text-right">{{ fC(totalBuyRev) }}</td><td class="py-3 px-4 text-right">{{ fC(totalSellPay) }}</td><td class="py-3 px-4 text-right text-blue-600">{{ fC(gstCollected) }}</td><td class="py-3 px-4 text-right text-emerald-600">{{ fC(spreadRev) }}</td><td class="py-3 px-4 text-right text-lg text-slate-800 dark:text-white">{{ fC(gstCollected + spreadRev) }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RevenueComponent implements OnInit {
  private mock = inject(MockDataService);
  totalBuyRev=0; totalSellPay=0; gstCollected=0; spreadRev=0;
  goldBuyVol=0; goldSellVol=0; silverBuyVol=0; silverSellVol=0;
  goldGst=0; silverGst=0; goldSpread=0; silverSpread=0;
  monthlyData: {month:string;buyPct:number;gstPct:number}[] = [];

  ngOnInit() {
    const buys = this.mock.getBuyTransactions(500);
    const sells = this.mock.getSellTransactions(200);
    this.goldBuyVol = buys.filter(b => b.metalType === 'gold').reduce((s, b) => s + b.totalAmount, 0);
    this.silverBuyVol = buys.filter(b => b.metalType === 'silver').reduce((s, b) => s + b.totalAmount, 0);
    this.goldSellVol = sells.filter(s => s.metalType === 'gold').reduce((a, s) => a + s.totalAmount, 0);
    this.silverSellVol = sells.filter(s => s.metalType === 'silver').reduce((a, s) => a + s.totalAmount, 0);
    this.totalBuyRev = this.goldBuyVol + this.silverBuyVol;
    this.totalSellPay = this.goldSellVol + this.silverSellVol;
    this.goldGst = Math.round(this.goldBuyVol * 0.03);
    this.silverGst = Math.round(this.silverBuyVol * 0.03);
    this.gstCollected = this.goldGst + this.silverGst;
    this.goldSpread = Math.round((this.goldBuyVol - this.goldSellVol) * 0.04);
    this.silverSpread = Math.round((this.silverBuyVol - this.silverSellVol) * 0.04);
    this.spreadRev = this.goldSpread + this.silverSpread;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const maxBuy = this.totalBuyRev / 8;
    this.monthlyData = months.map(m => ({ month: m, buyPct: 20 + Math.random() * 70, gstPct: 10 + Math.random() * 40 }));
  }
  fC(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
}
