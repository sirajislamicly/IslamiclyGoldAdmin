import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-security-report',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="Security &amp; Sessions" description="OTP verification funnel, active sessions, and authentication logs" iconText="S" iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <app-kpi-card label="OTPs Generated" [value]="fN(otpGenerated)" delta="+8%" icon="O" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="OTPs Verified" [value]="fN(otpVerified)" delta="+12%" icon="V" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Failed Attempts" [value]="fN(failedAttempts)" delta="-5%" icon="F" iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" sparklineColor="bg-red-400" />
        <app-kpi-card label="Expired OTPs" [value]="fN(expiredOtps)" icon="E" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
        <app-kpi-card label="Verification Rate" [value]="verifyRate + '%'" icon="%" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
      </div>

      <!-- OTP Funnel -->
      <div class="card">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">OTP Verification Funnel</h3>
        <div class="flex items-center gap-1 h-10 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold" [style.width.%]="verifyRate">{{ verifyRate }}% Verified</div>
          <div class="h-full bg-red-500 flex items-center justify-center text-xs text-white font-bold" [style.width.%]="failRate">{{ failRate }}% Failed</div>
          <div class="h-full bg-amber-500 flex items-center justify-center text-xs text-white font-bold" [style.width.%]="expireRate">{{ expireRate }}% Expired</div>
        </div>
      </div>

      <!-- Active Sessions -->
      <div class="card">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Recent Sessions</h3>
        <div class="space-y-2">
          @for (s of sessions; track s.id) {
            <div class="flex items-center gap-0 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div class="w-[180px] flex-shrink-0 min-w-0"><div class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ s.userAgent }}</div><div class="text-[10px] text-slate-400 font-mono">{{ s.ipAddress }}</div></div>
              <div class="w-[120px] flex-shrink-0 text-[11px] text-slate-500">{{ fD(s.createdAt) }}</div>
              <div class="w-[120px] flex-shrink-0 text-[11px] text-slate-500">{{ fD(s.expiresAt) }}</div>
              <div class="flex-1 px-4"><span class="badge text-[10px]" [ngClass]="s.isActive?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'">{{ s.isActive ? 'Active' : 'Expired' }}</span></div>
            </div>
          }
        </div>
      </div>

      <!-- OTP by Platform -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card"><h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Aug Platform OTPs</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl"><div><div class="text-xs text-slate-500">Generated</div><div class="text-lg font-bold text-blue-600">{{ fN(augOtpGen) }}</div></div><div><div class="text-xs text-slate-500">Max Attempts: 3</div><div class="text-xs text-slate-400">Expiry: 3 mins</div></div></div>
          </div>
        </div>
        <div class="card"><h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">GoldLite Platform OTPs</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl"><div><div class="text-xs text-slate-500">Generated</div><div class="text-lg font-bold text-violet-600">{{ fN(glOtpGen) }}</div></div><div><div class="text-xs text-slate-500">Max Attempts: 3</div><div class="text-xs text-slate-400">Expiry: 3 mins</div></div></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SecurityComponent implements OnInit {
  private api = inject(ApiService);
  otpGenerated=0; otpVerified=0; failedAttempts=0; expiredOtps=0; verifyRate=0; failRate=0; expireRate=0;
  augOtpGen=0; glOtpGen=0;
  sessions: {id:number;userAgent:string;ipAddress:string;createdAt:string;expiresAt:string;isActive:boolean}[] = [];

  ngOnInit() {
    forkJoin({
      otp: this.api.securityOtpKpis(),
      sessions: this.api.securityActiveSessions(15)
    }).subscribe({
      next: (res) => {
        const otp = res.otp || [];
        const sessions = res.sessions || [];
        const aug: any = otp.find((x: any) => x.platform === 'Aug') || {};
        const gl: any = otp.find((x: any) => x.platform === 'GoldLite') || {};
        this.augOtpGen = aug.generated || 0;
        this.glOtpGen = gl.generated || 0;
        this.otpGenerated = this.augOtpGen + this.glOtpGen;
        this.otpVerified = (aug.verified || 0) + (gl.verified || 0);
        this.failedAttempts = (aug.failed || 0) + (gl.failed || 0);
        this.expiredOtps = (aug.expired || 0) + (gl.expired || 0);
        const total = this.otpGenerated || 1;
        this.verifyRate = Math.round((this.otpVerified / total) * 100);
        this.failRate = Math.round((this.failedAttempts / total) * 100);
        this.expireRate = 100 - this.verifyRate - this.failRate;
        this.sessions = sessions.map((s: any) => ({
          id: s.id,
          userAgent: s.userAgent,
          ipAddress: s.ipAddress,
          createdAt: s.createdAtUtc,
          expiresAt: s.expiresAtUtc,
          isActive: !!s.isActive
        }));
      },
      error: () => {
        this.sessions = [];
      }
    });
  }
  fN(n:number){return new Intl.NumberFormat('en-IN').format(n);}
  fD(d:string){try{return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit',hour:'2-digit',minute:'2-digit'});}catch{return d;}}
}
