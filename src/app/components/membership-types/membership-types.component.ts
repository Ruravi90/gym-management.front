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

  loadData(): void {
    this.loading = true;

    const activeOnly = this.filters.isActive === 'true';
    this.membershipService.getMembershipTypes(0, 100, activeOnly).subscribe({
      next: (data) => {
        this.membershipTypes = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading membership types:', error);
        this.loading = false;
      }
    });
  }

  openNewTypeModal(): void {
    this.editingType = null;
    this.resetForm();
    this.showTypeModal = true;
  }

  openEditModal(type: MembershipType): void {
    this.editingType = { ...type };
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
          alert('Error updating membership type: ' + (error.error?.detail || error.message));
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
          alert('Error creating membership type: ' + (error.error?.detail || error.message));
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
          alert('Error desactivating membership type: ' + (error.error?.detail || error.message));
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
}