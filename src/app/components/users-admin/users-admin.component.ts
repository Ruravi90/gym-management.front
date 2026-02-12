import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

interface RoleOption { value: string; label: string }

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: boolean;
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

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5; // Show 5 items per page on mobile
  totalPages: number = 0;
  paginatedUsers: User[] = [];

  // Unified Modal State: Registro / Edición
  showUserModal = false;
  editingUser: User | null = null;
  userForm = {
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    status: true as boolean
  };

  // Delete Confirmation State
  showDeleteConfirm = false;
  deletingUser: User | null = null;

  roles: RoleOption[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'manager', label: 'Manager' },
    { value: 'member', label: 'Member' }
  ];

  getRoleLabel(value: string): string {
    // Usar bucle for en lugar de find para mayor compatibilidad
    for (let i = 0; i < this.roles.length; i++) {
      if (this.roles[i].value === value) {
        return this.roles[i].label;
      }
    }
    return (value || '').toUpperCase();
  }

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }



  // --- User Modal Controls ---
  openRegisterModal() {
    this.editingUser = null;
    this.resetForm();
    this.showUserModal = true;
  }

  openEditModal(user: User) {
    // Usar Object.assign en lugar de spread para mayor compatibilidad
    this.editingUser = Object.assign({}, user);
    this.userForm = {
      name: user.name,
      email: user.email,
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

  saveUser() {
    if (this.editingUser) {
      this.updateUser();
    } else {
      this.registerUser();
    }
  }

  registerUser() {
    if (!this.userForm.email || !this.userForm.password) {
      alert('Email y contraseña son obligatorios');
      return;
    }

    this.userService.createUser(this.userForm).subscribe({
      next: (res) => {
        alert('Usuario registrado exitosamente');
        this.closeUserModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        alert('Error al registrar usuario: ' + errorMessage);
      }
    });
  }

  updateUser() {
    if (!this.editingUser) return;

    // Prepare update data - don't send password if not changed
    const updateData: any = {
      name: this.userForm.name,
      email: this.userForm.email,
      role: this.userForm.role,
      status: this.userForm.status
    };

    // Only include password if it was entered
    if (this.userForm.password) {
      updateData.password = this.userForm.password;
    }

    this.userService.updateUser(this.editingUser.id, updateData).subscribe({
      next: (res) => {
        alert('Usuario actualizado exitosamente');
        this.closeUserModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        alert('Error actualizando usuario: ' + errorMessage);
      }
    });
  }

  resetForm() {
    this.userForm = {
      name: '',
      email: '',
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
        alert('Usuario eliminado exitosamente');
        this.closeDeleteConfirmation();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        alert('Error eliminando usuario: ' + errorMessage);
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

