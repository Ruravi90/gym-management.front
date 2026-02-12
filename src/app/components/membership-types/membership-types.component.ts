import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { 
  MembershipService, 
  MembershipType,
  CreateMembershipTypeRequest,
  UpdateMembershipTypeRequest
} from '../../services/membership.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-membership-types',
  templateUrl: './membership-types.component.html',
  styleUrls: ['./membership-types.component.css']
})
export class MembershipTypesComponent implements OnInit {
  membershipTypes: MembershipType[] = [];
  loading = true;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5; // Show 5 items per page on mobile
  totalPages: number = 0;
  paginatedMembershipTypes: MembershipType[] = [];

  // Form state
  showTypeModal = false;
  editingType: MembershipType | null = null;
  typeForm: CreateMembershipTypeRequest = {
    name: '',
    duration_days: null,
    accesses_allowed: null,
    price: 0,
    description: '',
    is_active: true
  };

  // Filters
  filters = {
    isActive: ''
  };

  constructor(
    private membershipService: MembershipService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }


  openNewTypeModal(): void {
    this.editingType = null;
    this.resetForm();
    this.showTypeModal = true;
  }

  openEditModal(type: MembershipType): void {
    // Usar Object.assign en lugar de spread para mayor compatibilidad
    this.editingType = Object.assign({}, type);
    this.typeForm = {
      name: type.name,
      duration_days: type.duration_days || null,
      accesses_allowed: type.accesses_allowed || null,
      price: type.price,
      description: type.description || '',
      is_active: type.is_active
    };
    this.showTypeModal = true;
  }

  closeTypeModal(): void {
    this.showTypeModal = false;
    this.resetForm();
  }

  saveType(): void {
    if (this.editingType) {
      // Update existing type
      const updateData: UpdateMembershipTypeRequest = {
        name: this.typeForm.name,
        duration_days: this.typeForm.duration_days,
        accesses_allowed: this.typeForm.accesses_allowed,
        price: this.typeForm.price,
        description: this.typeForm.description,
        is_active: this.typeForm.is_active
      };

      this.membershipService.updateMembershipType(this.editingType.id, updateData).subscribe(
        response => {
          console.log('Membership type updated successfully', response);
          this.loadData();
          this.closeTypeModal();
        },
        error => {
          console.error('Error updating membership type:', error);
          // Usar sintaxis compatible en lugar de encadenamiento opcional
          const errorMessage = error.error && error.error.detail ? error.error.detail : error.message;
          alert('Error updating membership type: ' + errorMessage);
        }
      );
    } else {
      // Create new type
      this.membershipService.createMembershipType(this.typeForm).subscribe(
        response => {
          console.log('Membership type created successfully', response);
          this.loadData();
          this.closeTypeModal();
        },
        error => {
          console.error('Error creating membership type:', error);
          // Usar sintaxis compatible en lugar de encadenamiento opcional
          const errorMessage = error.error && error.error.detail ? error.error.detail : error.message;
          alert('Error creating membership type: ' + errorMessage);
        }
      );
    }
  }

  deleteType(id: number): void {
    if (confirm('¿Estás seguro de que quieres desactivar este tipo de membresía?')) {
      this.membershipService.deleteMembershipType(id).subscribe(
        response => {
          console.log('Membership type deactivated successfully', response);
          this.loadData();
        },
        error => {
          console.error('Error deactivating membership type:', error);
          // Usar sintaxis compatible en lugar de encadenamiento opcional
          const errorMessage = error.error && error.error.detail ? error.error.detail : error.message;
          alert('Error desactivating membership type: ' + errorMessage);
        }
      );
    }
  }

  resetForm(): void {
    this.typeForm = {
      name: '',
      duration_days: null,
      accesses_allowed: null,
      price: 0,
      description: '',
      is_active: true
    };
  }

  applyFilters(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.filters = {
      isActive: ''
    };
    this.loadData();
  }

  logout() {
    this.authService.logout();
  }

  // Pagination methods
  calculatePagination() {
    // Calculate total pages
    this.totalPages = Math.ceil(this.membershipTypes.length / this.itemsPerPage);

    // Calculate start and end index for current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Slice the membership types for current page
    this.paginatedMembershipTypes = this.membershipTypes.slice(startIndex, endIndex);
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

    const activeOnly = this.filters.isActive === 'true';
    this.membershipService.getMembershipTypes(0, 100, activeOnly).subscribe({
      next: (data) => {
        this.membershipTypes = data;
        this.calculatePagination(); // Calculate pagination after loading data
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading membership types:', error);
        this.loading = false;
      }
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
}