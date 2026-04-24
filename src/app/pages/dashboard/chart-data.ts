export interface Series {
  name: string;
  series: { name: string; value: number }[];
}

export interface Result {
  name: string;
  value: number;
}

export function toLineSeries(
  raws: { name: string; data: number[] }[],
  labels: string[]
): Series[] {
  const minLen = Math.min(...raws.map(r => r.data.length), labels.length);
  return raws.map(raw => ({
    name: raw.name,
    series: labels.slice(0, minLen).map((label, i) => ({
      name: label,
      value: raw.data[i] ?? 0,
    })),
  }));
}

export function toPieResults(raw: { label: string; value: number }[]): Result[] {
  return raw.map(r => ({ name: r.label, value: r.value }));
}

export function toSparkSeries(data: number[]): Series[] {
  if (!data.length) return [];
  return [{ name: 'spark', series: data.map((v, i) => ({ name: `p${i}`, value: v })) }];
}