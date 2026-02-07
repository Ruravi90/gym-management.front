import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

interface RoleOption { value: string; label: string }

@Component({
	selector: 'app-users-admin',
	templateUrl: './users-admin.component.html',
	styleUrls: ['./users-admin.component.css']
})
export class UsersAdminComponent implements OnInit {
	users: any[] = [];
	filteredUsers: any[] = [];
	loading = false;
	error: string | null = null;

	// Minimal create form state
	creating = false;
	newUser: any = { name: '', email: '', password: '', role: 'receptionist' };

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
			next: (res) => { this.users = res; this.filteredUsers = [...res]; this.loading = false; },
			error: (err) => { this.error = err?.message || 'Error fetching users'; this.loading = false; }
		});
	}

	onSearch(event: any): void {
		const q = (event?.target?.value || '').toLowerCase();
		if (!q) { this.filteredUsers = [...this.users]; return; }
		this.filteredUsers = this.users.filter(u => {
			const name = (u.name || '').toLowerCase();
			const email = (u.email || '').toLowerCase();
			return name.includes(q) || email.includes(q);
		});
	}

	startCreate(): void { this.creating = true; }
	cancelCreate(): void { this.creating = false; this.newUser = { name: '', email: '', password: '', role: 'receptionist' }; }

	createUser(): void {
		if (!this.newUser.email || !this.newUser.password) { alert('Email and password required'); return; }
		this.userService.createUser(this.newUser).subscribe({ next: () => { this.cancelCreate(); this.loadUsers(); }, error: (e) => alert('Error creating user') });
	}

	deleteUser(id: number): void {
		if (!confirm('¿Eliminar usuario?')) return;
		this.userService.deleteUser(id).subscribe({ next: () => this.loadUsers(), error: (e) => alert('Error deleting user') });
	}

	toggleStatus(user: any): void {
		this.userService.changeUserStatus(user.id, !user.status).subscribe({ next: () => this.loadUsers(), error: () => alert('Error updating status') });
	}

	changeRole(user: any, role: string): void {
		this.userService.changeUserRole(user.id, role).subscribe({ next: () => this.loadUsers(), error: () => alert('Error changing role') });
	}
}

