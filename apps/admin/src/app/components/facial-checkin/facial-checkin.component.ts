import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AttendanceService, ClientService, MembershipService } from '@shared';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Html5Qrcode } from 'html5-qrcode';

type CheckinState = 'idle' | 'scanning' | 'verifying' | 'granted' | 'denied';

@Component({
  selector: 'app-facial-checkin',
  templateUrl: './facial-checkin.component.html',
  styleUrls: ['./facial-checkin.component.css']
})
export class FacialCheckinComponent implements OnInit, OnDestroy {
  state: CheckinState = 'idle';
  message = '';
  scanning = false;

  clientInfo: any = null;
  membershipInfo: any = null;
  lastVisit: any = null;

  manualMode = false;
  searchTerm = '';
  clients: any[] = [];
  manualClientId: number | null = null;

  private html5QrCode: Html5Qrcode | null = null;
  private displayTimer: any = null;
  private lastScannedToken = '';
  private lastScanTime = 0;

  constructor(
    private attendanceService: AttendanceService,
    private clientService: ClientService,
    private membershipService: MembershipService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.resetToIdle();
  }

  async startScanner(): Promise<void> {
    if (this.scanning) return;

    this.state = 'scanning';
    this.message = 'Apunta la cámara al código QR del socio';
    this.scanning = true;
    this.cdr.detectChanges();

    this.html5QrCode = new Html5Qrcode('qr-reader');

    try {
      await this.html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => this.onQrScanned(decodedText),
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      this.state = 'denied';
      this.message = 'Error al acceder a la cámara';
      this.scanning = false;
      this.cdr.detectChanges();
      this.displayTimer = setTimeout(() => this.resetToIdle(), 3000);
    }
  }

  private onQrScanned(token: string): void {
    const now = Date.now();
    if (token === this.lastScannedToken && now - this.lastScanTime < 5000) return;

    this.lastScannedToken = token;
    this.lastScanTime = now;

    this.stopScanner();
    this.state = 'verifying';
    this.message = 'Verificando código...';
    this.cdr.detectChanges();

    this.attendanceService.qrCheckIn(token).subscribe({
      next: (res) => {
        forkJoin({
          client: this.clientService.getClient(res.client_id).pipe(catchError(() => of(null))),
          membership: this.membershipService.getActiveMembershipByClient(res.client_id).pipe(catchError(() => of(null))),
          history: this.attendanceService.getAttendanceHistory(res.client_id).pipe(catchError(() => of([])))
        }).subscribe({
          next: (data) => {
            this.clientInfo = data.client;
            this.membershipInfo = data.membership;
            if (data.history?.length) {
              this.lastVisit = [...data.history].sort((a: any, b: any) =>
                new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
              )[0];
            }
            const hasAccess = this.isMembershipActive(data.membership?.end_date);
            this.state = hasAccess ? 'granted' : 'denied';
            this.message = hasAccess ? '¡Acceso Concedido!' : 'Acceso Denegado: Membresía no activa.';
            this.cdr.detectChanges();
            this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
          },
          error: () => {
            this.state = 'denied';
            this.message = 'Error al obtener datos del socio.';
            this.cdr.detectChanges();
            this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
          }
        });
      },
      error: (err) => {
        this.state = 'denied';
        this.message = err.error?.detail || 'Código inválido o expirado.';
        this.cdr.detectChanges();
        this.displayTimer = setTimeout(() => this.resetToIdle(), 3000);
      }
    });
  }

  private stopScanner(): void {
    if (this.html5QrCode && this.scanning) {
      this.html5QrCode.stop().catch(() => {});
      this.scanning = false;
    }
  }

  resetToIdle(): void {
    this.stopScanner();
    if (this.displayTimer) { clearTimeout(this.displayTimer); this.displayTimer = null; }
    this.state = 'idle';
    this.message = '';
    this.clientInfo = null;
    this.membershipInfo = null;
    this.lastVisit = null;
    this.manualMode = false;
    this.cdr.detectChanges();
  }

  stopCamera(): void {
    this.resetToIdle();
  }

  isMembershipActive(endDate: string | undefined | null): boolean {
    if (!endDate) return false;
    return new Date(endDate) >= new Date();
  }

  toggleManualMode(): void {
    this.manualMode = !this.manualMode;
    if (this.manualMode) {
      this.searchTerm = '';
      this.clients = [];
      this.loadClients();
    }
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => { this.clients = data; this.cdr.detectChanges(); },
      error: () => { this.clients = []; this.cdr.detectChanges(); }
    });
  }

  searchClients(): void {
    if (this.searchTerm.trim()) {
      this.clientService.searchClients(this.searchTerm).subscribe({
        next: (data) => { this.clients = data; this.cdr.detectChanges(); },
        error: () => { this.clients = []; this.cdr.detectChanges(); }
      });
    } else {
      this.loadClients();
    }
  }

  checkInManual(): void {
    if (!this.manualClientId) {
      this.message = 'Seleccione un socio.';
      this.state = 'denied';
      this.cdr.detectChanges();
      setTimeout(() => this.resetToIdle(), 3000);
      return;
    }

    this.state = 'verifying';
    this.message = 'Procesando...';
    this.cdr.detectChanges();

    this.attendanceService.checkInManual(this.manualClientId).subscribe({
      next: (res) => {
        forkJoin({
          client: this.clientService.getClient(res.client_id).pipe(catchError(() => of(null))),
          membership: this.membershipService.getActiveMembershipByClient(res.client_id).pipe(catchError(() => of(null))),
          history: this.attendanceService.getAttendanceHistory(res.client_id).pipe(catchError(() => of([])))
        }).subscribe({
          next: (data) => {
            this.clientInfo = data.client;
            this.membershipInfo = data.membership;
            if (data.history?.length) {
              this.lastVisit = [...data.history].sort((a: any, b: any) =>
                new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
              )[0];
            }
            const hasAccess = this.isMembershipActive(data.membership?.end_date);
            this.state = hasAccess ? 'granted' : 'denied';
            this.message = hasAccess ? '¡Acceso Concedido!' : 'Acceso Denegado: Membresía no activa.';
            this.manualMode = false;
            this.cdr.detectChanges();
            this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
          },
          error: () => {
            this.state = 'denied';
            this.message = 'Error al obtener datos.';
            this.manualMode = false;
            this.cdr.detectChanges();
            this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
          }
        });
      },
      error: (err) => {
        this.state = 'denied';
        this.message = err.error?.detail || 'Error al registrar ingreso.';
        this.manualMode = false;
        this.cdr.detectChanges();
        this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
      }
    });
  }
}
