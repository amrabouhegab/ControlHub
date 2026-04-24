import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { toSparkSeries, Series } from '../../chart-data';
import { singleColor, ChartColors } from '../../../../core/chart-theme';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgxChartsModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css'
})
export class KpiCardComponent {
  label = input<string>('');
  value = input<string>('');
  delta = input<string>('');
  direction = input<'up' | 'down'>('up');
  meta = input<string>('');
  spark = input<number[]>([]);
  tone = input<'accent' | 'good' | 'warn' | 'info'>('accent');

  sparkSeries = computed<Series[]>(() => toSparkSeries(this.spark()));

  colors = computed<ChartColors[]>(() => singleColor(this.tone()));

  deltaClass = computed(() => this.direction() === 'up' ? 'up' : 'down');
}