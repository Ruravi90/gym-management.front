import { Component, OnDestroy, OnInit } from '@angular/core';
import { TenantWhatsappService, TenantWhatsappStatus } from '../../../../../../libs/shared/src/services/tenant-whatsapp.service';

@Component({
  selector: 'app-tenant-whatsapp',
  template: `<section class="whatsapp-page"><header><span class="eyebrow">Integraciones</span><h1>Conectar WhatsApp</h1><p>Conecta el WhatsApp de tu gimnasio escaneando el código QR.</p></header><article class="card"><div class="status"><strong>Estado</strong><span [class.ok]="status?.active">{{ status?.active ? 'Conectado' : 'Desconectado' }}</span></div><p *ngIf="error" class="error">{{ error }}</p><p *ngIf="status?.status === 'NOT_FOUND'" class="muted">Sesión aún no creada</p><div class="qr" *ngIf="qrUrl"><img [src]="qrUrl" alt="Código QR para conectar WhatsApp"></div><p *ngIf="loading">Consultando conexión...</p><p *ngIf="!loading && !status?.active && !qrUrl">Presiona conectar para generar una sesión segura para este gimnasio.</p><div class="actions"><button class="btn btn-primary" [disabled]="loading || !!status?.active" (click)="connect()">{{ qrUrl ? 'Actualizar QR' : 'Conectar WhatsApp' }}</button><button class="btn btn-outline" [disabled]="loading || !status?.active" (click)="disconnect()">Desconectar</button></div></article></section>`,
  styles: [`.whatsapp-page{max-width:700px;margin:0 auto}.whatsapp-page header{margin-bottom:1.5rem}.whatsapp-page h1{margin:.25rem 0;color:var(--text-main)}.whatsapp-page header p,.card p{color:var(--text-muted)}.eyebrow{color:var(--lime-700)}.card{background:var(--app-surface);border:1px solid var(--app-border);border-radius:var(--radius-lg);padding:1.5rem;box-shadow:var(--shadow-sm)}.status{display:flex;justify-content:space-between;align-items:center;font-size:1rem}.status span{color:var(--text-muted);font-weight:700}.status span.ok{color:var(--app-success)}.qr{display:flex;justify-content:center;padding:1.5rem}.qr img{width:min(280px,100%);height:auto}.actions{display:flex;gap:.75rem;flex-wrap:wrap}.error{color:var(--app-danger)!important}@media(max-width:600px){.whatsapp-page{padding:.75rem 0}.card{padding:1rem}.actions button{flex:1 1 100%}}`]
})
export class TenantWhatsappComponent implements OnInit, OnDestroy {
  status: TenantWhatsappStatus | null = null; qrUrl = ''; loading = false; error = '';
  constructor(private service: TenantWhatsappService) {}
  ngOnInit(): void { this.refresh(); }
  ngOnDestroy(): void { this.clearQr(); }
  refresh(): void { this.loading = true; this.service.getStatus().subscribe({ next: s => { this.status = s; this.loading = false; }, error: e => { this.error = this.messageFor(e, 'No se pudo consultar WhatsApp.'); this.loading = false; } }); }
  connect(): void { this.loading = true; this.error = ''; this.service.connect().subscribe({ next: s => { this.status = s; this.service.getQr().subscribe({ next: blob => { this.clearQr(); this.qrUrl = URL.createObjectURL(blob); this.loading = false; }, error: e => { this.error = e?.error?.detail || 'No se pudo obtener el QR.'; this.loading = false; } }); }, error: e => { this.error = e?.error?.detail || 'No se pudo crear la sesión.'; this.loading = false; } }); }
  disconnect(): void { this.loading = true; this.service.disconnect().subscribe({ next: () => { this.clearQr(); this.status = { session: '', status: 'LOGGED_OUT', active: false }; this.loading = false; }, error: e => { this.error = e?.error?.detail || 'No se pudo desconectar.'; this.loading = false; } }); }
  private messageFor(error: any, fallback: string): string { const detail = error?.error?.detail; return detail === 'Not Found' ? 'Sesión aún no creada' : (detail || fallback); }
  private clearQr(): void { if (this.qrUrl) URL.revokeObjectURL(this.qrUrl); this.qrUrl = ''; }
}
