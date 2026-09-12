export interface DashboardStat {
  id: string;
  title: string;
  count: number;
  badgeText?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'info';
  iconType: 'calendar' | 'parking' | 'payment' | 'bell';
  actionLink: string;
  actionText: string;
}
