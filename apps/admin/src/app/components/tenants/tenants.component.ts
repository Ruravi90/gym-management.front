import { Component, OnInit } from '@angular/core';
import { TenantService } from '@shared';
import { Tenant, TenantCreate, TenantStats } from '@shared';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.css']
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = true;
  showModal = false;
  showDetailModal = false;
  editingTenant: Tenant | null = null;
  selectedTenant: Tenant | null = null;
  tenantStats: TenantStats | null = null;
  searchTerm = '';
  statusFilter = '';
  page = 1;
  pageSize = 20;

  formData: TenantCreate = {
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    max_users: 10
  };

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantService.getTenants(this.statusFilter || undefined).subscribe({
      next: (data) => {
        this.tenants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenants', err);
        this.loading = false;
      }
    });
  }

  get filteredTenants(): Tenant[] {
    if (!this.searchTerm) return this.tenants;
    const term = this.searchTerm.toLowerCase();
    return this.tenants.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.slug.toLowerCase().includes(term) ||
      (t.email && t.email.toLowerCase().includes(term))
    );
  }

  get pagedTenants(): Tenant[] { return this.filteredTenants.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredTenants.length / this.pageSize)); }
  applyFilter(): void { this.page = 1; }
  previousPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }

  openCreateModal(): void {
    this.editingTenant = null;
    this.formData = { name: '', slug: '', email: '', phone: '', address: '', max_users: 10 };
    this.showModal = true;
  }

  openEditModal(tenant: Tenant): void {
    this.editingTenant = tenant;
    this.formData = {
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      max_users: tenant.max_users
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTenant = null;
  }

  generateSlug(): void {
    this.formData.slug = this.formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  saveTenant(): void {
    if (this.editingTenant) {
      this.tenantService.updateTenant(this.editingTenant.id, this.formData).subscribe({
        next: () => {
          this.loadTenants();
          this.closeModal();
        },
        error: (err) => console.error('Error updating tenant', err)
      });
    } else {
      this.tenantService.createTenant(this.formData).subscribe({
        next: () => {
          this.loadTenants();
          this.closeModal();
        },
        error: (err) => console.error('Error creating tenant', err)
      });
    }
  }

  viewTenant(tenant: Tenant): void {
    window.location.href = `/platform/tenants/${tenant.id}`;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTenant = null;
    this.tenantStats = null;
  }

  toggleStatus(tenant: Tenant): void {
    const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
    this.tenantService.updateTenant(tenant.id, { status: newStatus }).subscribe({
      next: () => this.loadTenants(),
      error: (err) => console.error('Error toggling tenant status', err)
    });
  }

  deleteTenant(tenant: Tenant): void {
    if (confirm(`¿Eliminar el tenant "${tenant.name}"? Esta acción no se puede deshacer.`)) {
      this.tenantService.deleteTenant(tenant.id).subscribe({
        next: () => this.loadTenants(),
        error: (err) => console.error('Error deleting tenant', err)
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'suspended': return 'badge-danger';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      default: return status;
    }
  }
}
