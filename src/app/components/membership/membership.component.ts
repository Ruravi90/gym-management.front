import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { 
  MembershipService, 
  Membership as ServiceMembership, 
  MembershipWithClient as ServiceMembershipWithClient,
  MembershipStatistics,
  MembershipType,
  CreateMembershipRequest,
  UpdateMembershipRequest
} from '../../services/membership.service';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css']
})
export class MembershipComponent implements OnInit {
  memberships: ServiceMembershipWithClient[] = [];
  clients: any[] = [];
  membershipTypes: MembershipType[] = [];
  statistics: MembershipStatistics | null = null;
  loading = true;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5; // Show 5 items per page on mobile
  totalPages: number = 0;
  paginatedMemberships: ServiceMembershipWithClient[] = [];

  // Form state
  showMembershipModal = false;
  editingMembership: ServiceMembershipWithClient | null = null;
  membershipForm: CreateMembershipRequest = {
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

  // Filters
  filters = {
    status: '',
    paymentStatus: '',
    clientId: '',
    membershipTypeId: ''
  };

  // Filter visibility
  showFilters = false;

  constructor(
    private membershipService: MembershipService,
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }



  loadClients(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService.getClients().subscribe({
        next: (data) => {
          this.clients = data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          reject(error);
        }
      });
    });
  }

  loadMembershipTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.membershipService.getMembershipTypes(0, 100, false).subscribe({
        next: (data) => {
          this.membershipTypes = data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading membership types:', error);
          reject(error);
        }
      });
    });
  }

  loadStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.membershipService.getMembershipStatistics().subscribe({
        next: (data) => {
          this.statistics = data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
          reject(error);
        }
      });
    });
  }

  loadClientDetailsForMemberships(): void {
    // For each membership, get the client details
    // Usar bucle for en lugar de forEach y find para mayor compatibilidad
    for (let i = 0; i < this.memberships.length; i++) {
      const membership = this.memberships[i];
      for (let j = 0; j < this.clients.length; j++) {
        const client = this.clients[j];
        if (client.id === membership.client_id) {
          membership.client = client;
          break;
        }
      }
    }
  }

  openNewMembershipModal(): void {
    this.editingMembership = null;
    this.resetForm();
    this.showMembershipModal = true;
  }

  openEditModal(membership: ServiceMembershipWithClient): void {
    // Usar Object.assign en lugar del operador spread para mayor compatibilidad
    this.editingMembership = Object.assign({}, membership);
    this.membershipForm = {
      client_id: membership.client_id,
      membership_type_id: membership.membership_type_id,
      type: membership.type,
      start_date: membership.start_date ? membership.start_date.split('T')[0] : '',
      end_date: membership.end_date ? membership.end_date.split('T')[0] : '',
      price: membership.price,
      price_paid: membership.price_paid || membership.price,
      status: membership.status,
      payment_status: membership.payment_status,
      payment_method: membership.payment_method || '',
      notes: membership.notes || ''
    };
    this.showMembershipModal = true;
  }

  closeMembershipModal(): void {
    this.showMembershipModal = false;
    this.resetForm();
  }

  saveMembership(): void {
    if (this.editingMembership) {
      // Update existing membership
      const updateData: UpdateMembershipRequest = {
        status: this.membershipForm.status,
        payment_status: this.membershipForm.payment_status,
        payment_method: this.membershipForm.payment_method,
        notes: this.membershipForm.notes
      };


      this.membershipService.updateMembership(this.editingMembership.id, updateData).subscribe(
        response => {
          console.log('Membership updated successfully', response);
          this.loadData();
          this.closeMembershipModal();
        },
        error => {
          console.error('Error updating membership:', error);
          // Usar sintaxis compatible en lugar de encadenamiento opcional
          const errorMessage = error.error && error.error.detail ? error.error.detail : error.message;
          alert('Error updating membership: ' + errorMessage);
        }
      );
    } else {
      // Create new membership
      this.membershipService.createMembership(this.membershipForm).subscribe(
        response => {
          console.log('Membership created successfully', response);
          this.loadData();
          this.closeMembershipModal();
        },
        error => {
          console.error('Error creating membership:', error);
          // Usar sintaxis compatible en lugar de encadenamiento opcional
          const errorMessage = error.error && error.error.detail ? error.error.detail : error.message;
          alert('Error creating membership: ' + errorMessage);
        }
      );
    }
  }

  deleteMembership(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta membresía?')) {
      this.membershipService.deleteMembership(id).subscribe(
        response => {
          console.log('Membership deleted successfully', response);
          this.loadData();
        },
        error => {
          console.error('Error deleting membership:', error);
          // Usar sintaxis compatible en lugar de encadenamiento opcional
          const errorMessage = error.error && error.error.detail ? error.error.detail : error.message;
          alert('Error eliminando membresía: ' + errorMessage);
        }
      );
    }
  }

  onStartDateChange(): void {
    if (this.membershipForm.start_date) {
      let duration = 30;
      if (this.membershipForm.membership_type_id) {
        // Usar bucle for en lugar de find para mayor compatibilidad
        let selectedType = null;
        for (let i = 0; i < this.membershipTypes.length; i++) {
          if (this.membershipTypes[i].id == this.membershipForm.membership_type_id) {
            selectedType = this.membershipTypes[i];
            break;
          }
        }
        if (selectedType && selectedType.duration_days) {
          duration = selectedType.duration_days;
        }
      }
      this.membershipForm.end_date = this.calculateEndDate(this.membershipForm.start_date, duration);
    }
  }

  onMembershipTypeChange(): void {
    if (this.membershipForm.membership_type_id) {
      // Usar bucle for en lugar de find para mayor compatibilidad
      let selectedType = null;
      for (let i = 0; i < this.membershipTypes.length; i++) {
        if (this.membershipTypes[i].id == this.membershipForm.membership_type_id) {
          selectedType = this.membershipTypes[i];
          break;
        }
      }
      if (selectedType) {
        // Set price based on membership type
        this.membershipForm.price = selectedType.price;
        this.membershipForm.price_paid = selectedType.price;

        // Calculate end date based on duration
        const duration = selectedType.duration_days || 30;
        this.membershipForm.end_date = this.calculateEndDate(this.membershipForm.start_date, duration);
      }
    }
  }

  calculateEndDate(startDateStr: string, durationDays: number = 30): string {
    const startDate = new Date(startDateStr);
    // Add days (manually to avoid timezone shifts)
    const endDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));

    // Usar método más compatible para formatear la fecha
    const year = endDate.getFullYear();
    const month = ('0' + (endDate.getMonth() + 1)).slice(-2);
    const day = ('0' + endDate.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
  }

  resetForm(): void {
    // Usar método más compatible para obtener la fecha actual
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const todayStr = year + '-' + month + '-' + day;

    this.membershipForm = {
      client_id: 0,
      membership_type_id: undefined,
      type: 'basic',
      start_date: todayStr,
      end_date: this.calculateEndDate(todayStr),
      price: 0,
      price_paid: 0,
      status: 'active',
      payment_status: 'pending',
      payment_method: '',
      notes: ''
    };
  }

  getStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'available':
        return '#38bdf8'; // light blue / sky
      case 'active':
        return '#4ade80'; // vibrant green
      case 'expired':
        return '#f87171'; // soft red
      case 'suspended':
        return '#fbbf24'; // amber
      case 'cancelled':
        return '#94a3b8'; // slate gray
      default:
        return '#60a5fa'; // blue
    }
  }

  getClientName(clientId: number): string {
    // Usar bucle for en lugar de find para mayor compatibilidad
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i].id === clientId) {
        return this.clients[i].name;
      }
    }
    return 'Cliente Desconocido';
  }

  getMembershipTypeName(membershipTypeId: number | undefined): string {
    if (!membershipTypeId) return 'Tipo no definido';
    // Usar bucle for en lugar de find para mayor compatibilidad
    for (let i = 0; i < this.membershipTypes.length; i++) {
      if (this.membershipTypes[i].id === membershipTypeId) {
        return this.membershipTypes[i].name;
      }
    }
    return 'Tipo desconocido';
  }

  viewClientHistory(clientId: number): void {
    this.router.navigate(['/client-membership-history', clientId]);
  }

  applyFilters(): void {
    // This would typically filter the displayed memberships
    // For now, we'll just reload with the current filters applied
    this.loadMemberships();
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      paymentStatus: '',
      clientId: '',
      membershipTypeId: ''
    };
    this.loadMemberships();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isMembershipExpired(membership: ServiceMembershipWithClient): boolean {
    const endDate = new Date(membership.end_date);
    const today = new Date();
    return endDate < today;
  }

  daysUntilExpiration(membership: ServiceMembershipWithClient): number {
    const endDate = new Date(membership.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getAccessesRemaining(membership: ServiceMembershipWithClient): string {
    if (membership.accesses_used === undefined) return 'Ilimitado';
    
    const membershipType = this.membershipTypes.find(mt => mt.id === membership.membership_type_id);
    if (!membershipType || membershipType.accesses_allowed === null) {
      return 'Ilimitado';
    }
    
    const remaining = membershipType.accesses_allowed - membership.accesses_used;
    return `${remaining} de ${membershipType.accesses_allowed}`;
  }

  logout() {
    this.authService.logout();
  }

  // Pagination methods
  calculatePagination() {
    // Calculate total pages
    this.totalPages = Math.ceil(this.memberships.length / this.itemsPerPage);

    // Calculate start and end index for current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Slice the memberships for current page
    this.paginatedMemberships = this.memberships.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.calculatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.calculatePagination();
    }
  }

  // Update loadData to include pagination
  loadData(): void {
    this.loading = true;

    // Load memberships, clients, membership types, and statistics in parallel
    Promise.all([
      this.loadMemberships(),
      this.loadClients(),
      this.loadMembershipTypes(),
      this.loadStatistics()
    ]).then(() => {
      this.calculatePagination(); // Calculate pagination after loading data
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.loading = false;
    });
  }

  // Update loadMemberships to recalculate pagination
  loadMemberships(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.membershipService.getMemberships().subscribe({
        next: (data) => {
          this.memberships = data;
          // Fetch client details for each membership
          this.loadClientDetailsForMemberships();
          this.calculatePagination(); // Recalculate pagination after loading new data
          resolve();
        },
        error: (error) => {
          console.error('Error loading memberships:', error);
          reject(error);
        }
      });
    });
  }

  // Helper method to generate page numbers for pagination UI
  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Toggle filter visibility
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
}