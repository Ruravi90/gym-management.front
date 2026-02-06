import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MembershipService, Membership } from '../../services/membership.service';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-membership-history',
  templateUrl: './client-membership-history.component.html',
  styleUrls: ['./client-membership-history.component.css']
})
export class ClientMembershipHistoryComponent implements OnInit {
  @Input() clientId?: number;
  
  client: any = null;
  memberships: Membership[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private membershipService: MembershipService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Check if clientId was passed as input, otherwise get from route params
    if (this.clientId) {
      this.loadClientData(this.clientId);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadClientData(+id);
      } else {
        this.loading = false;
        this.error = 'Client ID is required';
      }
    }
  }

  loadClientData(clientId: number): void {
    this.loading = true;
    this.error = null;

    // Load client information
    this.clientService.getClient(clientId).subscribe({
      next: (client) => {
        this.client = client;
        
        // Load membership history
        this.membershipService.getMembershipHistory(clientId).subscribe({
          next: (memberships) => {
            this.memberships = memberships;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading membership history:', err);
            this.error = 'Error loading membership history';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading client:', err);
        this.error = 'Error loading client information';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'active':
        return '#28a745'; // green
      case 'expired':
        return '#dc3545'; // red
      case 'suspended':
        return '#ffc107'; // yellow
      case 'cancelled':
        return '#6c757d'; // gray
      default:
        return '#007bff'; // blue
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isMembershipExpired(membership: Membership): boolean {
    const endDate = new Date(membership.end_date);
    const today = new Date();
    return endDate < today;
  }

  isMembershipActive(membership: Membership): boolean {
    return membership.status === 'active' && !this.isMembershipExpired(membership);
  }

  daysUntilExpiration(membership: Membership): number {
    const endDate = new Date(membership.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getActiveMembershipsCount(): number {
    return this.memberships.filter(m => m.status === 'active' && !this.isMembershipExpired(m)).length;
  }

  getExpiredMembershipsCount(): number {
    return this.memberships.filter(m => this.isMembershipExpired(m)).length;
  }

  getDaysSinceExpiration(membership: Membership): number {
    return Math.abs(this.daysUntilExpiration(membership));
  }
}