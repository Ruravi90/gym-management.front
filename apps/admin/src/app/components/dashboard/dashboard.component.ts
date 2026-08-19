import { Component, OnInit } from '@angular/core';
import { ClientService } from '@shared';
import { MembershipService, MembershipStatistics } from '@shared';
import { AuthService } from '@shared';
import { AnalyticsService, DashboardAnalytics } from '@shared';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: MembershipStatistics | null = null;
  analytics: DashboardAnalytics | null = null;
  totalClients: number = 0;
  loading = true;

  attendanceData: any[] = [];
  revenueData: any[] = [];
  membershipTypeData: any[] = [];

  activeMembersPercentage: number = 0;
  revenueGoalProgress: number = 0;
  monthlyRevenueGoal: number = 5000;

  greeting: string = '';
  currentDateTime: string = '';

  expiredCount: number = 0;

  curve: any = shape.curveCardinal;

  colorScheme: Color = {
    name: 'brand',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#84cc16', '#65a30d', '#a3e635', '#16a34a', '#f59e0b', '#3f6212']
  };

  revenueColorScheme: Color = {
    name: 'revenue',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#10b981']
  };

  constructor(
    private clientService: ClientService,
    private membershipService: MembershipService,
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadDashboardData();
  }

  setGreeting(): void {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) this.greeting = 'Buenos días';
    else if (hour < 18) this.greeting = 'Buenas tardes';
    else this.greeting = 'Buenas noches';

    this.currentDateTime = now.toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    Promise.all([
      this.loadClientsCount(),
      this.loadMembershipStats(),
      this.loadAnalytics()
    ]).then(() => {
      this.loading = false;
    }).catch(err => {
      console.error('Error loading dashboard data', err);
      this.loading = false;
    });
  }

  loadAnalytics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService.getDashboardAnalytics().subscribe({
        next: (data) => {
          this.analytics = data;
          this.processChartData(data);
          resolve();
        },
        error: (err) => {
          console.error('Error loading analytics', err);
          reject(err);
        }
      });
    });
  }

  processChartData(data: DashboardAnalytics): void {
    this.attendanceData = [{
      name: 'Asistencia',
      series: data.attendance_history.map(item => ({
        name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        value: item.value
      }))
    }];

    this.revenueData = [{
      name: 'Ingresos',
      series: data.revenue_history.map(item => ({
        name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        value: item.value
      }))
    }];

    this.membershipTypeData = data.membership_distribution;

    if (this.stats && this.stats.total_memberships > 0) {
      this.activeMembersPercentage = Math.round((this.stats.active_memberships / this.stats.total_memberships) * 100);
    }

    if (this.analytics) {
      this.revenueGoalProgress = Math.min(100, Math.round((this.analytics.total_revenue_month / this.monthlyRevenueGoal) * 100));
    }
  }

  loadClientsCount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService.getClients().subscribe({
        next: (clients) => {
          this.totalClients = clients.length;
          resolve();
        },
        error: reject
      });
    });
  }

  loadMembershipStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.membershipService.getMembershipStatistics().subscribe({
        next: (stats) => {
          this.stats = stats;
          this.expiredCount = stats.expired_memberships;
          resolve();
        },
        error: reject
      });
    });
  }

  getExpirationDays(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  getExpirationLabel(endDate: string): string {
    const days = this.getExpirationDays(endDate);
    if (days <= 0) return 'Vencida';
    if (days === 1) return 'Mañana';
    return `En ${days} días`;
  }

  getExpirationBadgeClass(endDate: string): string {
    const days = this.getExpirationDays(endDate);
    if (days <= 0) return 'badge-danger';
    if (days <= 3) return 'badge-warning';
    return 'badge-primary';
  }

  logout(): void {
    this.authService.logout();
  }
}
