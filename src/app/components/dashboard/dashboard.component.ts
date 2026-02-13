import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { MembershipService, MembershipStatistics } from '../../services/membership.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService, DashboardAnalytics } from '../../services/analytics.service';
import { Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
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

  // Chart Properties
  attendanceData: any[] = [];
  revenueData: any[] = [];
  membershipTypeData: any[] = [];
  
  legendPosition = LegendPosition.Right;
  curve: any = shape.curveBasis;

  colorScheme: Color = {
    name: 'vibrant',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981']
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
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load all data in parallel
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

  processChartData(data: DashboardAnalytics) {
    // Process Attendance History
    this.attendanceData = [{
      name: 'Asistencia',
      series: data.attendance_history.map(item => ({
        name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        value: item.value
      }))
    }];

    // Process Revenue History
    this.revenueData = [{
      name: 'Ingresos',
      series: data.revenue_history.map(item => ({
        name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        value: item.value
      }))
    }];

    // Process Membership Distribution
    this.membershipTypeData = data.membership_distribution;
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
          resolve();
        },
        error: reject
      });
    });
  }

  logout() {
    this.authService.logout();
  }
}
