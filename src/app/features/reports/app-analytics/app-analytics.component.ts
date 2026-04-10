import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-app-analytics',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">App Analytics</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Play Store and App Store downloads, ratings, and reviews</p>
      </div>

      <!-- Platform Toggle -->
      <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 w-fit">
        <button (click)="platform = 'both'"
                [class]="platform === 'both' ? 'px-4 py-1.5 text-sm font-medium bg-white dark:bg-slate-600 text-gold-600 rounded-md shadow-sm' : 'px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 rounded-md'">
          Both Platforms
        </button>
        <button (click)="platform = 'android'"
                [class]="platform === 'android' ? 'px-4 py-1.5 text-sm font-medium bg-white dark:bg-slate-600 text-green-600 rounded-md shadow-sm' : 'px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 rounded-md'">
          Google Play
        </button>
        <button (click)="platform = 'ios'"
                [class]="platform === 'ios' ? 'px-4 py-1.5 text-sm font-medium bg-white dark:bg-slate-600 text-blue-600 rounded-md shadow-sm' : 'px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 rounded-md'">
          App Store
        </button>
      </div>

      <!-- Combined KPIs -->
      @if (platform === 'both') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-kpi-card label="Total Downloads" [value]="formatNum(analytics.playStore.downloads + analytics.appStore.downloads)" delta="+12%" icon="D" iconBgClass="bg-blue-50 text-blue-600" />
          <app-kpi-card label="Active Installs" [value]="formatNum(analytics.playStore.activeInstalls + analytics.appStore.activeInstalls)" delta="+8%" icon="A" iconBgClass="bg-green-50 text-green-600" />
          <app-kpi-card label="Avg Rating" [value]="avgRating.toFixed(1)" icon="R" iconBgClass="bg-amber-50 text-amber-600" />
          <app-kpi-card label="Total Reviews" [value]="formatNum(analytics.playStore.totalReviews + analytics.appStore.totalReviews)" delta="+5%" icon="V" iconBgClass="bg-purple-50 text-purple-600" />
        </div>
      }

      <!-- Platform Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Play Store -->
        @if (platform === 'both' || platform === 'android') {
          <div class="card border-l-4 border-l-green-500">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.27l8.41-8.41-8.41-8.41c-.31.38-.5.86-.5 1.38v14.06c0 .52.19 1 .5 1.38zm1.44 1.12l9.55-5.52-2.13-2.13-7.42 7.42-.01.23zm10.66-6.18L21.17 14.5c.6-.35.83-.87.83-1.5s-.23-1.15-.83-1.5l-5.89-3.71-2.64 2.64 2.64 2.64.01.14zm-1.92-8.98L4.62.7C4.48.63 4.33.58 4.18.54l9.18 9.18v-.49z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800 dark:text-white">Google Play Store</h3>
                <p class="text-xs text-slate-500">Android App Analytics</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Downloads</div>
                <div class="text-lg font-bold text-slate-800 dark:text-white">{{ formatNum(analytics.playStore.downloads) }}</div>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Active Installs</div>
                <div class="text-lg font-bold text-slate-800 dark:text-white">{{ formatNum(analytics.playStore.activeInstalls) }}</div>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Rating</div>
                <div class="text-lg font-bold text-amber-600">{{ analytics.playStore.rating }} / 5</div>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Reviews</div>
                <div class="text-lg font-bold text-slate-800 dark:text-white">{{ formatNum(analytics.playStore.totalReviews) }}</div>
              </div>
            </div>

            <!-- Rating Distribution -->
            <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating Distribution</h4>
            <div class="space-y-1.5">
              @for (star of [5,4,3,2,1]; track star) {
                <div class="flex items-center gap-2 text-sm">
                  <span class="w-4 text-right text-slate-500">{{ star }}</span>
                  <span class="text-amber-500 text-xs">&#9733;</span>
                  <div class="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full" [style.width.%]="getReviewPct(analytics.playStore.reviewSummary, star, analytics.playStore.totalReviews)"></div>
                  </div>
                  <span class="w-10 text-right text-slate-500 text-xs">{{ getReviewCount(analytics.playStore.reviewSummary, star) }}</span>
                </div>
              }
            </div>

            <!-- Daily Downloads -->
            <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 mt-4">Daily Downloads (Last 30 Days)</h4>
            <div class="h-24 flex items-end gap-0.5">
              @for (val of analytics.playStore.dailyDownloads; track $index) {
                <div class="flex-1 bg-green-500 rounded-t hover:bg-green-400 transition-colors"
                     [style.height.%]="(val / maxPlayDownload) * 100"
                     [title]="val + ' downloads'"></div>
              }
            </div>
          </div>
        }

        <!-- App Store -->
        @if (platform === 'both' || platform === 'ios') {
          <div class="card border-l-4 border-l-blue-500">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800 dark:text-white">Apple App Store</h3>
                <p class="text-xs text-slate-500">iOS App Analytics</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Downloads</div>
                <div class="text-lg font-bold text-slate-800 dark:text-white">{{ formatNum(analytics.appStore.downloads) }}</div>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Active Installs</div>
                <div class="text-lg font-bold text-slate-800 dark:text-white">{{ formatNum(analytics.appStore.activeInstalls) }}</div>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Rating</div>
                <div class="text-lg font-bold text-amber-600">{{ analytics.appStore.rating }} / 5</div>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="text-xs text-slate-500">Reviews</div>
                <div class="text-lg font-bold text-slate-800 dark:text-white">{{ formatNum(analytics.appStore.totalReviews) }}</div>
              </div>
            </div>

            <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating Distribution</h4>
            <div class="space-y-1.5">
              @for (star of [5,4,3,2,1]; track star) {
                <div class="flex items-center gap-2 text-sm">
                  <span class="w-4 text-right text-slate-500">{{ star }}</span>
                  <span class="text-amber-500 text-xs">&#9733;</span>
                  <div class="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" [style.width.%]="getReviewPct(analytics.appStore.reviewSummary, star, analytics.appStore.totalReviews)"></div>
                  </div>
                  <span class="w-10 text-right text-slate-500 text-xs">{{ getReviewCount(analytics.appStore.reviewSummary, star) }}</span>
                </div>
              }
            </div>

            <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 mt-4">Daily Downloads (Last 30 Days)</h4>
            <div class="h-24 flex items-end gap-0.5">
              @for (val of analytics.appStore.dailyDownloads; track $index) {
                <div class="flex-1 bg-blue-500 rounded-t hover:bg-blue-400 transition-colors"
                     [style.height.%]="(val / maxAppDownload) * 100"
                     [title]="val + ' downloads'"></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AppAnalyticsComponent implements OnInit {
  private mockData = inject(MockDataService);

  analytics!: ReturnType<MockDataService['getAppAnalytics']>;
  platform: 'both' | 'android' | 'ios' = 'both';
  avgRating = 0;
  maxPlayDownload = 1;
  maxAppDownload = 1;

  ngOnInit(): void {
    this.analytics = this.mockData.getAppAnalytics();
    this.avgRating = (this.analytics.playStore.rating + this.analytics.appStore.rating) / 2;
    this.maxPlayDownload = Math.max(...this.analytics.playStore.dailyDownloads, 1);
    this.maxAppDownload = Math.max(...this.analytics.appStore.dailyDownloads, 1);
  }

  getReviewPct(summary: Record<number, number>, star: number, total: number): number {
    return ((summary[star] || 0) / total) * 100;
  }

  getReviewCount(summary: Record<number, number>, star: number): number {
    return summary[star] || 0;
  }

  formatNum(n: number): string {
    return new Intl.NumberFormat('en-IN').format(n);
  }
}
