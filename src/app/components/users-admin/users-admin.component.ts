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
    const found = this.roles.find(r => r.value === value);
    return found ? found.label : (value || '').toUpperCase();
  }

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => { 
        this.users = res; 
        this.filteredUsers = [...res]; 
        this.loading = false; 
      },
      error: (err) => { 
        this.error = err?.message || 'Error fetching users'; 
        this.loading = false; 
      }
    });
  }

  onSearch(event: any): void {
    const q = (event?.target?.value || '').toLowerCase();
    if (!q) { 
      this.filteredUsers = [...this.users]; 
      return; 
    }
    this.filteredUsers = this.users.filter(u => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }

  // --- User Modal Controls ---
  openRegisterModal() {
    this.editingUser = null;
    this.resetForm();
    this.showUserModal = true;
  }

  openEditModal(user: User) {
    this.editingUser = { ...user };
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
        alert('Error al registrar usuario: ' + (err.error?.detail || err.message));
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
        alert('Error actualizando usuario: ' + (err.error?.detail || err.message));
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
        alert('Error eliminando usuario: ' + (err.error?.detail || err.message));
      }
    });
  }
}

