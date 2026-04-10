import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface SearchResult {
  type: 'navigation' | 'data' | 'metric';
  title: string;
  description: string;
  route?: string;
  queryParams?: Record<string, string>;
  value?: string | number;
}

@Injectable({ providedIn: 'root' })
export class NLSearchService {
  private router = inject(Router);

  search(query: string): SearchResult[] {
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Time-based patterns
    const timeRange = this.extractTimeRange(q);

    // SIP queries
    if (q.includes('sip')) {
      if (q.includes('fail')) {
        results.push({
          type: 'navigation',
          title: 'SIP Failures',
          description: `View SIP payment failures${timeRange ? ' for ' + timeRange.label : ''}`,
          route: '/reports/sip',
          queryParams: { status: 'Failed', ...(timeRange ? { from: timeRange.from, to: timeRange.to } : {}) }
        });
      }
      if (q.includes('success')) {
        results.push({
          type: 'navigation',
          title: 'Successful SIPs',
          description: `View successful SIP payments${timeRange ? ' for ' + timeRange.label : ''}`,
          route: '/reports/sip',
          queryParams: { status: 'Success', ...(timeRange ? { from: timeRange.from, to: timeRange.to } : {}) }
        });
      }
      if (!q.includes('fail') && !q.includes('success')) {
        results.push({
          type: 'navigation',
          title: 'SIP Reports',
          description: 'View all SIP data and analytics',
          route: '/reports/sip'
        });
      }
    }

    // User queries
    if (q.includes('user') || q.includes('customer')) {
      if (q.includes('join') || q.includes('new') || q.includes('register') || q.includes('sign')) {
        results.push({
          type: 'navigation',
          title: 'New User Registrations',
          description: `Users who joined${timeRange ? ' ' + timeRange.label : ''}`,
          route: '/reports/users',
          queryParams: timeRange ? { from: timeRange.from, to: timeRange.to } : {}
        });
      }
      if (q.includes('total') || q.includes('how many') || q.includes('count')) {
        results.push({
          type: 'navigation',
          title: 'Total Users Report',
          description: 'View total user count and breakdown',
          route: '/reports/users'
        });
      }
      if (!results.length) {
        results.push({
          type: 'navigation',
          title: 'User Reports',
          description: 'View all user data and analytics',
          route: '/reports/users'
        });
      }
    }

    // Goal queries
    if (q.includes('goal')) {
      if (q.includes('top') || q.includes('perform') || q.includes('best')) {
        results.push({
          type: 'navigation',
          title: 'Top Performing Goals',
          description: 'Goals sorted by completion percentage',
          route: '/reports/goals',
          queryParams: { sort: 'progress' }
        });
      }
      results.push({
        type: 'navigation',
        title: 'Goal Reports',
        description: 'View goal analytics and progress',
        route: '/reports/goals'
      });
    }

    // Transaction queries
    if (q.includes('transaction') || q.includes('buy') || q.includes('sell') || q.includes('purchase')) {
      if (q.includes('buy') || q.includes('purchase')) {
        results.push({
          type: 'navigation',
          title: 'Buy Transactions',
          description: `View buy transactions${timeRange ? ' for ' + timeRange.label : ''}`,
          route: '/reports/transactions',
          queryParams: { type: 'buy', ...(timeRange ? { from: timeRange.from, to: timeRange.to } : {}) }
        });
      }
      if (q.includes('sell')) {
        results.push({
          type: 'navigation',
          title: 'Sell Transactions',
          description: `View sell transactions${timeRange ? ' for ' + timeRange.label : ''}`,
          route: '/reports/transactions',
          queryParams: { type: 'sell', ...(timeRange ? { from: timeRange.from, to: timeRange.to } : {}) }
        });
      }
      if (!q.includes('buy') && !q.includes('sell')) {
        results.push({
          type: 'navigation',
          title: 'All Transactions',
          description: 'View all transaction data',
          route: '/reports/transactions'
        });
      }
    }

    // Nomination queries
    if (q.includes('nomin')) {
      results.push({
        type: 'navigation',
        title: 'Nomination Reports',
        description: 'View nominee data and analytics',
        route: '/reports/nominations'
      });
    }

    // Analytics queries
    if (q.includes('analytic') || q.includes('download') || q.includes('app store') || q.includes('play store') || q.includes('rating')) {
      results.push({
        type: 'navigation',
        title: 'App Analytics',
        description: 'View app store analytics, downloads, and ratings',
        route: '/reports/app-analytics'
      });
    }

    // Dashboard
    if (q.includes('dashboard') || q.includes('overview') || q.includes('summary')) {
      results.push({
        type: 'navigation',
        title: 'Dashboard',
        description: 'View dashboard overview',
        route: '/dashboard'
      });
    }

    // Gold/Silver rate
    if (q.includes('rate') || q.includes('price') || q.includes('gold rate') || q.includes('silver rate')) {
      results.push({
        type: 'navigation',
        title: 'Current Rates',
        description: 'View current gold and silver rates',
        route: '/dashboard'
      });
    }

    // Redeem / Orders
    if (q.includes('redeem') || q.includes('order') || q.includes('delivery')) {
      results.push({
        type: 'navigation',
        title: 'Orders & Redemptions',
        description: 'View order and redemption data',
        route: '/reports/transactions',
        queryParams: { tab: 'orders' }
      });
    }

    // Gift
    if (q.includes('gift')) {
      results.push({
        type: 'navigation',
        title: 'Gift Transactions',
        description: 'View peer-to-peer gift data',
        route: '/reports/transactions',
        queryParams: { tab: 'gifts' }
      });
    }

    // Fallback
    if (!results.length) {
      results.push(
        { type: 'navigation', title: 'Dashboard', description: 'Go to dashboard', route: '/dashboard' },
        { type: 'navigation', title: 'User Reports', description: 'View user reports', route: '/reports/users' },
        { type: 'navigation', title: 'Transaction Reports', description: 'View transactions', route: '/reports/transactions' },
        { type: 'navigation', title: 'SIP Reports', description: 'View SIP data', route: '/reports/sip' }
      );
    }

    return results;
  }

  navigateToResult(result: SearchResult): void {
    if (result.route) {
      this.router.navigate([result.route], { queryParams: result.queryParams });
    }
  }

  private extractTimeRange(q: string): { from: string; to: string; label: string } | null {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    if (q.includes('today')) {
      return { from: fmt(now), to: fmt(now), label: 'today' };
    }
    if (q.includes('yesterday')) {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: fmt(y), to: fmt(y), label: 'yesterday' };
    }
    if (q.includes('last 7 day') || q.includes('this week') || q.includes('past week')) {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      return { from: fmt(d), to: fmt(now), label: 'last 7 days' };
    }
    if (q.includes('last 30 day') || q.includes('this month') || q.includes('past month')) {
      const d = new Date(now); d.setDate(d.getDate() - 30);
      return { from: fmt(d), to: fmt(now), label: 'last 30 days' };
    }
    if (q.includes('last 90 day') || q.includes('last 3 month') || q.includes('this quarter')) {
      const d = new Date(now); d.setDate(d.getDate() - 90);
      return { from: fmt(d), to: fmt(now), label: 'last 90 days' };
    }
    return null;
  }
}
