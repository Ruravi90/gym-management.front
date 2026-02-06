import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { MembershipService, MembershipStatistics } from '../../services/membership.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: MembershipStatistics | null = null;
  totalClients: number = 0;
  loading = true;

  constructor(
    private clientService: ClientService,
    private membershipService: MembershipService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load statistics in parallel
    Promise.all([
      this.loadClientsCount(),
      this.loadMembershipStats()
    ]).then(() => {
      this.loading = false;
    }).catch(err => {
      console.error('Error loading dashboard data', err);
      this.loading = false;
    });
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
