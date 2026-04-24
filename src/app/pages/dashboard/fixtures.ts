export interface KpiDef {
  label: string;
  value: string;
  delta: string;
  dir: 'up' | 'down';
  meta: string;
  spark: number[];
  tone: 'accent' | 'good' | 'warn' | 'info';
}

export const KPIS: KpiDef[] = [
  { label: 'Active users', value: '4,218', delta: '+8.2%', dir: 'up', meta: 'vs last 30 days', spark: [12,15,14,18,17,22,20,25,23,28,30,29,34], tone: 'accent' },
  { label: 'Revenue (MTD)', value: '$284.1k', delta: '+12.4%', dir: 'up', meta: '$3.2M annualized', spark: [40,42,41,45,48,47,52,55,54,60,58,63,65], tone: 'good' },
  { label: 'Active sessions', value: '1,084', delta: '-3.1%', dir: 'down', meta: 'last 5 minutes', spark: [22,25,23,24,22,21,23,20,19,21,20,22,21], tone: 'info' },
  { label: 'Error rate', value: '0.42%', delta: '-0.08pp', dir: 'up', meta: 'p50 168ms · p99 840ms', spark: [8,7,6,8,5,6,4,5,4,3,4,3,3], tone: 'warn' },
];

export const GROWTH_SERIES_RAW = {
  signups: [12,15,18,14,22,28,26,32,30,36,42,40,48,52,50,58,62,60,68,72,70,78,84,82,90,94,92,98],
  wau: [8,10,11,12,14,18,17,20,22,24,28,26,32,34,35,38,42,41,46,48,50,54,58,60,63,65,68],
  days: Array.from({ length: 26 }, (_, i) => i % 4 === 0 ? `Apr ${i + 1}` : '')
};

export const TRAFFIC_MIX_RAW = [
  { label: 'Direct', value: 4820, tone: 'accent' },
  { label: 'Search', value: 3120, tone: 'good' },
  { label: 'Referral', value: 1920, tone: 'warn' },
  { label: 'Email', value: 840, tone: 'info' },
];

export interface FeedItem {
  icon: string;
  title: string;
  subtitle?: string;
  time: string;
  tone?: 'default' | 'danger' | 'accent';
}

export const ACTIVITY: FeedItem[] = [
  { icon: 'person_add', title: 'Amelia Chen', subtitle: 'registered new user Priya Raghavan', time: '2m ago' },
  { icon: 'shopping_cart', title: 'Marcus Holloway', subtitle: 'placed order #4829 - $249.00', time: '15m ago' },
  { icon: 'autorenew', title: 'Sofie Lindqvist', subtitle: 'renewed subscription for Acme Corp', time: '1h ago' },
  { icon: 'sync', title: 'System', subtitle: 'completed data sync - 1,247 records', time: '3h ago' },
  { icon: 'settings', title: 'Jordan Blake', subtitle: 'updated payment gateway settings', time: '5h ago' },
];

export const ALERTS: FeedItem[] = [
  { icon: 'warning', title: 'Unusual spike in failed logins', subtitle: '23 failures in the last 10 minutes', time: '12 min ago', tone: 'danger' },
  { icon: 'trending_up', title: 'Traffic 40% above normal', subtitle: 'Check for bots or campaign', time: '1 hour ago', tone: 'accent' },
  { icon: 'error_outline', title: 'Payment declined', subtitle: 'Stripe: card expired for order #4815', time: '2 hours ago', tone: 'danger' },
];