import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService, Client, MeasurementsComponent } from '@shared';

@Component({
  selector: 'app-admin-measurements',
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>📏 Medidas de Clientes</h1>
        <p>Selecciona un cliente para ver, registrar y editar sus medidas corporales.</p>
      </header>

      <section class="card mb-2">
        <div class="client-selector">
          <label class="field" style="flex:1; margin-bottom:0;">
            Seleccionar cliente
            <select class="app-input" [(ngModel)]="selectedClientId" (ngModelChange)="onClientChange()">
              <option [ngValue]="null">— Selecciona un cliente —</option>
              <option *ngFor="let c of clients" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </label>
        </div>
      </section>

      <section class="card client-profile" *ngIf="selectedClient">
        <div class="profile-heading"><div><span class="eyebrow">Datos fijos del socio</span><h2>{{ selectedClient.name }}</h2></div><div class="profile-actions"><span class="status" [class.inactive]="!selectedClient.status">{{ selectedClient.status ? 'Activo' : 'Inactivo' }}</span><button class="btn btn-outline btn-sm" (click)="editSelectedClient()">Editar ficha</button></div></div>
        <div class="profile-grid">
          <div><span>Correo</span><strong>{{ selectedClient.email || 'No registrado' }}</strong></div>
          <div><span>Teléfono</span><strong>{{ selectedClient.phone || 'No registrado' }}</strong></div>
          <div><span>Membresía</span><strong>{{ selectedClient.membership_type || 'Sin membresía' }}</strong></div>
          <div><span>Socio desde</span><strong>{{ selectedClient.created_at | date:'dd MMM, yyyy' }}</strong></div>
        </div>
        <p class="profile-note">La información personal se administra desde la sección Socios. Las medidas de abajo son el historial de progreso.</p>
      </section>

      <div *ngIf="loading" class="loading">Cargando clientes...</div>

      <app-measurements
        *ngIf="selectedClientId"
        [clientId]="selectedClientId"
        [hideBackButton]="true"
        [adminMode]="true">
      </app-measurements>

      <div *ngIf="!selectedClientId && !loading" class="empty-state">
        <p>Selecciona un cliente para ver sus medidas.</p>
      </div>
    </div>
  `,
  styles: [`
    .client-selector { display: flex; align-items: flex-end; gap: 1rem; width: 100%; }
    .client-selector .field { flex: 1 1 100%; width: 100%; min-width: 0; }
    .client-selector .app-input { display: block; width: 100%; min-width: 0; box-sizing: border-box; }
    .client-profile { margin-bottom: 1rem; }
    .profile-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1rem; }
    .profile-heading h2 { margin:.25rem 0 0; }
    .profile-actions { display:flex; align-items:center; gap:.75rem; }
    .eyebrow, .profile-grid span { display:block; color:var(--text-muted); font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
    .profile-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; }
    .profile-grid strong { display:block; margin-top:.3rem; }
    .status { color:#3f7d08; background:#effbdc; border-radius:999px; padding:.35rem .7rem; font-size:.8rem; font-weight:700; }
    .status.inactive { color:#9b3d3d; background:#fdeaea; }
    .profile-note { color:var(--text-muted); font-size:.82rem; margin:1rem 0 0; }
    @media (max-width: 760px) { .profile-grid { grid-template-columns:repeat(2, 1fr); } }
    @media (max-width: 520px) { .client-selector { flex-direction: column; } }
  `]
})
export class AdminMeasurementsComponent implements OnInit {
  clients: Client[] = [];
  selectedClientId: number | null = null;
  loading = true;

  get selectedClient(): Client | undefined { return this.clients.find(client => client.id === this.selectedClientId); }

  constructor(private clientService: ClientService, private router: Router) { }

  editSelectedClient(): void { if (this.selectedClientId) { void this.router.navigate(['/clients'], { queryParams: { edit: this.selectedClientId } }); } }

  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data.filter(c => c.status);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.loading = false;
      }
    });
  }

  onClientChange(): void {
    // Trigger change detection for the child component
    this.selectedClientId = this.selectedClientId ? Number(this.selectedClientId) : null;
  }
}
