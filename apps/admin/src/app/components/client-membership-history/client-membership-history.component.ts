import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MembershipService, Membership, MembershipType, CreateMembershipRequest } from '@shared';
import { ClientService } from '@shared';

@Component({
  selector: 'app-client-membership-history',
  templateUrl: './client-membership-history.component.html',
  styleUrls: ['./client-membership-history.component.css']
})
export class ClientMembershipHistoryComponent implements OnInit {
  @Input() clientId?: number;

  client: any = null;
  memberships: Membership[] = [];
  membershipTypes: MembershipType[] = [];
  loading = true;
  error: string | null = null;

  // Modal state
  showMembershipModal = false;

  // New membership form
  newMembershipForm: CreateMembershipRequest = {
    client_id: 0,
    membership_type_id: undefined,
    type: 'basic',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    price: 0,
    price_paid: 0,
    status: 'active',
    payment_status: 'pending',
    payment_method: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private membershipService: MembershipService,
    private clientService: ClientService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Load membership types first
      await this.loadMembershipTypes();

      // Then load client data
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
    } catch (error) {
      console.error('Error initializing component:', error);
      this.error = 'Error inicializando componente';
      this.loading = false;
    }
  }

  loadMembershipTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.membershipService.getMembershipTypes().subscribe({
        next: (types) => {
          this.membershipTypes = types;
          resolve();
        },
        error: (err) => {
          console.error('Error loading membership types:', err);
          reject(err);
        }
      });
    });
  }

  loadClientData(clientId: number): void {
    this.loading = true;
    this.error = null;

    // Load client information
    this.clientService.getClient(clientId).subscribe({
      next: (client) => {
        this.client = client;
        // Set the client_id in the new membership form
        this.newMembershipForm.client_id = clientId;

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

  loadData(): void {
    // Reload data
    if (this.clientId) {
      this.loadClientData(this.clientId);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadClientData(+id);
      }
    }
  }

  // Handle membership type change to update price and end date
  onMembershipTypeChange(): void {
    console.log('Membership type changed to:', this.newMembershipForm.membership_type_id);
    if (this.newMembershipForm.membership_type_id) {
      // Use == to handle potential string/number comparison
      const selectedType = this.membershipTypes.find(type => type.id == this.newMembershipForm.membership_type_id);
      console.log('Selected type found:', selectedType);
      
      if (selectedType) {
        this.newMembershipForm.price = selectedType.price;
        this.newMembershipForm.price_paid = selectedType.price;

        // Calculate end date based on duration
        if (selectedType.duration_days) {
          const startDateString = this.newMembershipForm.start_date;
          // Split by dash to avoid timezone shifts when initializing from just the date string
          const parts = startDateString.split('-');
          const startDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + selectedType.duration_days);
          this.newMembershipForm.end_date = endDate.toISOString().split('T')[0];
          console.log('Calculated end date:', this.newMembershipForm.end_date);
        }
      }
    }
  }

  // Handle start date change to recalculate end date
  onStartDateChange(): void {
    console.log('Start date changed to:', this.newMembershipForm.start_date);
    if (this.newMembershipForm.membership_type_id) {
      const selectedType = this.membershipTypes.find(type => type.id == this.newMembershipForm.membership_type_id);
      if (selectedType && selectedType.duration_days) {
        const startDateString = this.newMembershipForm.start_date;
        const parts = startDateString.split('-');
        const startDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + selectedType.duration_days);
        this.newMembershipForm.end_date = endDate.toISOString().split('T')[0];
        console.log('Recalculated end date:', this.newMembershipForm.end_date);
      }
    }
  }

  // Create or update a membership
  createMembership(): void {
    if (!this.newMembershipForm.client_id) {
      this.error = 'Client ID is required';
      return;
    }

    if (this.editingMembershipId) {
      // Update existing membership
      this.membershipService.updateMembership(this.editingMembershipId, this.newMembershipForm).subscribe({
        next: (updatedMembership) => {
          // Find and update the membership in the list
          const index = this.memberships.findIndex(m => m.id === this.editingMembershipId);
          if (index !== -1) {
            this.memberships[index] = updatedMembership;
          }
          // Close the modal
          this.closeMembershipModal();
          // Show success message
          alert('Membresía actualizada exitosamente');
        },
        error: (err) => {
          console.error('Error updating membership:', err);
          this.error = 'Error actualizando membresía: ' + (err.error?.detail || err.message);
        }
      });
    } else {
      // Create new membership
      this.membershipService.createMembership(this.newMembershipForm).subscribe({
        next: (newMembership) => {
          // Add the new membership to the list
          this.memberships.unshift(newMembership);
          // Close the modal
          this.closeMembershipModal();
          // Show success message
          alert('Membresía creada exitosamente');
        },
        error: (err) => {
          console.error('Error creating membership:', err);
          this.error = 'Error creando membresía: ' + (err.error?.detail || err.message);
        }
      });
    }
  }

  // Open the membership registration modal
  openNewMembershipModal(): void {
    // Reset the form first to ensure proper initialization
    this.resetNewMembershipForm();
    // Set the client ID
    this.newMembershipForm.client_id = this.client?.id || 0;
    // Show the modal
    this.showMembershipModal = true;
  }

  // Close the membership registration modal
  closeMembershipModal(): void {
    this.showMembershipModal = false;
    this.editingMembershipId = null;
    this.resetNewMembershipForm();
  }

  // Open the edit membership modal
  openEditModal(membership: Membership): void {
    // Set the form values to the membership being edited
    this.newMembershipForm = {
      client_id: membership.client_id,
      membership_type_id: membership.membership_type_id,
      type: membership.type,
      start_date: membership.start_date.split('T')[0], // Format date properly
      end_date: membership.end_date.split('T')[0], // Format date properly
      price: membership.price,
      price_paid: membership.price_paid || membership.price,
      status: membership.status,
      payment_status: membership.payment_status,
      payment_method: membership.payment_method || '',
      notes: membership.notes || ''
    };
    // Set the ID for the update operation
    this.editingMembershipId = membership.id;
    // Show the modal
    this.showMembershipModal = true;
  }

  // Editing membership ID
  editingMembershipId: number | null = null;

  // Delete a membership
  deleteMembership(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta membresía?')) {
      this.membershipService.deleteMembership(id).subscribe({
        next: () => {
          // Remove the membership from the list
          this.memberships = this.memberships.filter(m => m.id !== id);
          // Show success message
          alert('Membresía eliminada exitosamente');
        },
        error: (err) => {
          console.error('Error deleting membership:', err);
          alert('Error eliminando membresía: ' + (err.error?.detail || err.message));
        }
      });
    }
  }

  // Reset the new membership form
  resetNewMembershipForm(): void {
    this.newMembershipForm = {
      client_id: this.client?.id || 0,
      membership_type_id: undefined,
      type: 'basic',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      price: 0,
      price_paid: 0,
      status: 'active',
      payment_status: 'pending',
      payment_method: '',
      notes: ''
    };
    this.editingMembershipId = null;
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