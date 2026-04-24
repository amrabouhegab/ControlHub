import { Component, computed, input } from '@angular/core';

type Tone = 'good' | 'warn' | 'danger' | 'info' | 'accent' | 'neutral';

const MAP: Record<string, [Tone, string]> = {
  active: ['good', 'Active'],
  inactive: ['neutral', 'Inactive'],
  pending: ['warn', 'Pending'],
  paid: ['good', 'Paid'],
  processing: ['info', 'Processing'],
  shipped: ['accent', 'Shipped'],
  refunded: ['neutral', 'Refunded'],
  failed: ['danger', 'Failed'],
  open: ['info', 'Open'],
  resolved: ['good', 'Resolved'],
  high: ['danger', 'High'],
  normal: ['neutral', 'Normal'],
  low: ['neutral', 'Low'],
};

@Component({
  selector: 'app-status-chip',
  standalone: true,
  template: `
    <span class="chip" [class]="'tone-' + tone()" [attr.aria-label]="label()">
      <span class="dot"></span>{{ label() }}
    </span>
  `,
  styleUrl: './status-chip.css',
})
export class StatusChipComponent {
  status = input.required<string>();

  private mapped = computed<[Tone, string]>(() => {
    const m = MAP[this.status()];
    return m ?? ['neutral', this.status()];
  });

  tone = computed(() => this.mapped()[0]);
  label = computed(() => this.mapped()[1]);
}
