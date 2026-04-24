import { inject, Injectable } from '@angular/core';

export interface ColorEntry {
  name: string;
  value: string;
}

export interface ChartColors {
  name: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class ChartTheme {
  private _doc = typeof document !== 'undefined' ? document : null;

  resolve(key: string): string {
    if (!this._doc) return '';
    const el = this._doc.documentElement;
    const varName = key.startsWith('--sys-') ? key : `--sys-color-${key}`;
    return getComputedStyle(el).getPropertyValue(varName).trim();
  }

  chartColors(keys: string[]): ChartColors[] {
    return keys.map((key) => ({
      name: key,
      value: this.resolve(key),
    }));
  }

  domainPalette(): ColorEntry[] {
    return [
      { name: 'accent', value: this.resolve('accent') },
      { name: 'good', value: this.resolve('good') },
      { name: 'warn', value: this.resolve('warn') },
      { name: 'info', value: this.resolve('info') },
    ];
  }

  singleColor(tone: 'accent' | 'good' | 'warn' | 'info' | 'danger'): ColorEntry[] {
    const keyMap: Record<string, string> = {
      accent: 'accent',
      good: 'good',
      warn: 'warn',
      info: 'info',
      danger: 'danger',
    };
    return [{ name: 'spark', value: this.resolve(keyMap[tone] || tone) }];
  }
}

export function chartColors(keys: string[]): ChartColors[] {
  const theme = new ChartTheme();
  return theme.chartColors(keys);
}

export function domainPalette(): ColorEntry[] {
  const theme = new ChartTheme();
  return theme.domainPalette();
}

export function singleColor(tone: 'accent' | 'good' | 'warn' | 'info' | 'danger'): ColorEntry[] {
  const theme = new ChartTheme();
  return theme.singleColor(tone);
}