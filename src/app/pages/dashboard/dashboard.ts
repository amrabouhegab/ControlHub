import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { LiveAnnouncer, A11yModule } from '@angular/cdk/a11y';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { KpiCardComponent } from './components/kpi-card/kpi-card';
import { FeedListComponent } from './components/feed-list/feed-list';
import { KPIS, ACTIVITY, ALERTS, GROWTH_SERIES_RAW } from './fixtures';
import { toLineSeries, toPieResults } from './chart-data';
import { ChartColors as CC } from '../../core/chart-theme';

type Range = '30d' | '90d' | '1y';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    A11yModule,
    NgxChartsModule,
    KpiCardComponent,
    FeedListComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private readonly announcer = inject(LiveAnnouncer);

  range = signal<Range>('30d');

  kpis = signal(KPIS);

  activity = signal(ACTIVITY);
  alerts = signal(ALERTS);

  rangeOptions = [
    { label: 'Last 30 days', value: '30d' as Range },
    { label: 'Last 90 days', value: '90d' as Range },
    { label: 'Last year', value: '1y' as Range }
  ];

  lineSeries = computed(() => toLineSeries([
    { name: 'Signups', data: GROWTH_SERIES_RAW.signups },
    { name: 'WAU', data: GROWTH_SERIES_RAW.wau }
  ], GROWTH_SERIES_RAW.days));

  pieResults = computed(() => toPieResults([
    { label: 'Direct', value: 4820 },
    { label: 'Search', value: 3120 },
    { label: 'Referral', value: 1920 },
    { label: 'Email', value: 840 }
  ]));

  lineColors = computed<CC[]>(() => [
    { name: 'Signups', value: '#ff8c42' },
    { name: 'WAU', value: '#4f46e5' }
  ]);
  pieColors = computed<CC[]>(() => [
    { name: 'Direct', value: 'oklch(0.55 0.18 255)' },
    { name: 'Search', value: 'oklch(0.65 0.15 145)' },
    { name: 'Referral', value: 'oklch(0.7 0.13 60)' },
    { name: 'Email', value: 'oklch(0.6 0.17 30)' }
  ]);

  rangeLabel = computed(() => {
    const opt = this.rangeOptions.find(o => o.value === this.range());
    return opt?.label || 'Last 30 days';
  });

  setRange(value: Range): void {
    this.range.set(value);
    this.announcer.announce(`Showing last ${value === '30d' ? '30 days' : value === '90d' ? '90 days' : 'year'}`);
  }
}