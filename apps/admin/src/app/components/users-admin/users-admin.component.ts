import { Component, OnInit } from '@angular/core';
import { UserService } from '@shared';
import { AuthService } from '@shared';
import Swal from 'sweetalert2';

interface RoleOption { value: string; label: string }

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: boolean;
  tenant_id?: number;
  tenant_name?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.css']
})
export class UsersAdminComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any;

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage = '', 3500);
  }

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Show 10 items per page
  totalPages: number = 0;
  paginatedUsers: User[] = [];

  // Unified Modal State: Registro / Edición
  showUserModal = false;
  editingUser: User | null = null;
  userForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'receptionist',
    status: true as boolean
  };

  // Delete Confirmation State
  showDeleteConfirm = false;
  deletingUser: User | null = null;

  roles: RoleOption[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'manager', label: 'Manager' },
    { value: 'member', label: 'Member' }
  ];

  currentUser: any = null;

  getRoleLabel(value: string): string {
    for (let i = 0; i < this.roles.length; i++) {
      if (this.roles[i].value === value) {
        return this.roles[i].label;
      }
    }
    return (value || '').toUpperCase();
  }

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { 
    this.currentUser = this.authService.getCurrentUser();
  }

  getFilteredRoles(): RoleOption[] {
    if (!this.currentUser) return [];
    
    return this.roles;
  }

  canCreateUsers(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === 'super_admin' || this.currentUser.role === 'admin';
  }

  canManageUser(targetUser: User): boolean {
    if (!this.currentUser) return false;
    
    // Super Admin can manage anyone
    if (this.currentUser.role === 'super_admin') return true;
    
    // Admin can manage anyone except Super Admins
    if (this.currentUser.role === 'admin') {
      return targetUser.role !== 'super_admin';
    }
    
    return false;
  }

  ngOnInit(): void {
    this.loadUsers();
  }



  // --- User Modal Controls ---
  openRegisterModal() {
    if (!this.canCreateUsers()) {
      this.showToast('No tienes permisos para crear usuarios.', 'error');
      return;
    }
    this.editingUser = null;
    this.resetForm();
    this.userForm.role = 'receptionist'; // Default role
    this.showUserModal = true;
  }

  openEditModal(user: User) {
    if (!this.canManageUser(user)) {
      this.showToast('No tienes permisos para editar este usuario.', 'error');
      return;
    }
    // Usar Object.assign en lugar de spread para mayor compatibilidad
    this.editingUser = Object.assign({}, user);
    this.userForm = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '', // Don't prefill password for security
      role: user.role,
      status: user.status
    };
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.editingUser = null;
    this.resetForm();
  }

  setUserStatus(value: string | boolean): void {
    this.userForm.status = value === true || value === 'true';
  }

  saveUser() {
    this.userForm.email = this.userForm.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.userForm.email)) {
      this.showToast('Ingresa un correo electrónico válido.', 'error');
      return;
    }
    if (this.userForm.phone && !/^\d{10}$/.test(this.userForm.phone)) {
      this.showToast('El teléfono debe contener exactamente 10 dígitos numéricos.', 'error');
      return;
    }
    if (this.editingUser) {
      this.updateUser();
    } else {
      this.registerUser();
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = digits;
    this.userForm.phone = digits;
  }

  onEmailBlur(): void {
    this.userForm.email = this.userForm.email.trim().toLowerCase();
  }

  registerUser() {
    if (!this.userForm.email || !this.userForm.password) {
      this.showToast('Email y contraseña son obligatorios', 'error');
      return;
    }

    this.userService.createUser(this.userForm).subscribe({
      next: (res) => {
        this.showToast('Usuario registrado exitosamente');
        this.closeUserModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        this.showToast('Error al registrar usuario: ' + errorMessage, 'error');
      }
    });
  }

  updateUser() {
    if (!this.editingUser) return;

    // Prepare update data - don't send password if not changed
    const updateData: any = {
      name: this.userForm.name,
      email: this.userForm.email,
      phone: this.userForm.phone,
      role: this.userForm.role,
      status: this.userForm.status
    };

    // Only include password if it was entered
    if (this.userForm.password) {
      updateData.password = this.userForm.password;
    }

    this.userService.updateUser(this.editingUser.id, updateData).subscribe({
      next: (res) => {
        this.showToast('Usuario actualizado exitosamente');
        this.closeUserModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        this.showToast('Error actualizando usuario: ' + errorMessage, 'error');
      }
    });
  }

  async sendPasswordReset(): Promise<void> {
    if (!this.editingUser || !this.editingUser.email) return;
    const result = await Swal.fire({
      title: '¿Enviar enlace de contraseña?',
      text: `Se intentará enviar un enlace a ${this.editingUser.email} y también por WhatsApp si tiene teléfono registrado.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar enlace',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: { confirmButton: 'app-btn app-btn-primary', cancelButton: 'app-btn app-btn-secondary' }
    });
    if (!result.isConfirmed) return;
    this.authService.forgotPassword(this.editingUser.email, 'admin').subscribe({
      next: result => this.showToast(result.message),
      error: () => this.showToast('No se pudo solicitar el enlace. Intenta nuevamente.', 'error')
    });
  }

  resetForm() {
    this.userForm = {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'receptionist',
      status: true
    };
  }

  // --- Delete Controls ---
  confirmDelete(user: User) {
    this.deletingUser = user;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirm = false;
    this.deletingUser = null;
  }

  deleteUser(id: number | undefined) {
    if (!id) return;

    this.userService.deleteUser(id).subscribe({
      next: (res) => {
        this.showToast('Usuario eliminado exitosamente');
        this.closeDeleteConfirmation();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        this.showToast('Error eliminando usuario: ' + errorMessage, 'error');
      }
    });
  }

  // Pagination methods
  calculatePagination() {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);

    // Calculate start and end index for current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Slice the filtered users for current page
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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

  // Update onSearch to recalculate pagination
  onSearch(event: any): void {
    // Usar sintaxis compatible en lugar de encadenamiento opcional
    const target = event && event.target ? event.target : null;
    const value = target && target.value ? target.value : '';
    const q = value.toLowerCase();

    if (!q) {
      // Usar slice en lugar de spread para mayor compatibilidad
      this.filteredUsers = this.users.slice();
    } else {
      // Usar bucle for en lugar de filter para mayor compatibilidad
      this.filteredUsers = [];
      for (let i = 0; i < this.users.length; i++) {
        const u = this.users[i];
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        if (name.indexOf(q) !== -1 || email.indexOf(q) !== -1) {
          this.filteredUsers.push(u);
        }
      }
    }

    // Reset to first page when filtering
    this.currentPage = 1;
    this.calculatePagination();
  }

  // Update loadUsers to include pagination
  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.onSearch({ target: { value: '' } }); // This will also call calculatePagination()
        this.loading = false;
      },
      error: (err) => {
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        this.error = (err && err.message) ? err.message : 'Error fetching users';
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
