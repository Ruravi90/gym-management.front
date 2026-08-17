import { Component, OnInit } from '@angular/core';
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

      <div *ngIf="loading" class="loading">Cargando clientes...</div>

      <app-measurements
        *ngIf="selectedClientId"
        [clientId]="selectedClientId"
        [hideBackButton]="true"
        [hideReport]="true">
      </app-measurements>

      <div *ngIf="!selectedClientId && !loading" class="empty-state">
        <p>Selecciona un cliente para ver sus medidas.</p>
      </div>
    </div>
  `,
  styles: [`
    .client-selector { display: flex; align-items: flex-end; gap: 1rem; }
    @media (max-width: 520px) { .client-selector { flex-direction: column; } }
  `]
})
export class AdminMeasurementsComponent implements OnInit {
  clients: Client[] = [];
  selectedClientId: number | null = null;
  loading = true;

  constructor(private clientService: ClientService) { }

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
