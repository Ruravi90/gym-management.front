import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AttendanceService, ClientService, MembershipService } from '@shared';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Html5Qrcode } from 'html5-qrcode';

type CheckinState = 'scanning' | 'verifying' | 'granted' | 'denied';

@Component({
  selector: 'app-facial-checkin',
  templateUrl: './facial-checkin.component.html',
  styleUrls: ['./facial-checkin.component.css']
})
export class FacialCheckinComponent implements OnInit, OnDestroy {
  state: CheckinState = 'scanning';
  message = '';
  scanning = false;

  clientInfo: any = null;
  membershipInfo: any = null;
  lastVisit: any = null;

  pinMode = false;
  pinInput = '';

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

  ngOnInit(): void {
    setTimeout(() => this.startScanner(), 100);
  }

  ngOnDestroy(): void {
    this.stopScanner();
    if (this.displayTimer) { clearTimeout(this.displayTimer); }
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
      this.message = 'Error al acceder a la cámara';
      this.scanning = false;
      this.cdr.detectChanges();
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
            this.displayTimer = setTimeout(() => this.afterResult(), 4000);
          },
          error: () => {
            this.state = 'denied';
            this.message = 'Error al obtener datos del socio.';
            this.cdr.detectChanges();
            this.displayTimer = setTimeout(() => this.afterResult(), 3000);
          }
        });
      },
      error: (err) => {
        this.state = 'denied';
        this.message = err.error?.detail || 'Código inválido o expirado.';
        this.cdr.detectChanges();
        this.displayTimer = setTimeout(() => this.afterResult(), 3000);
      }
    });
  }

  private stopScanner(): void {
    if (this.html5QrCode && this.scanning) {
      this.html5QrCode.stop().catch(() => {});
      this.scanning = false;
    }
  }

  private afterResult(): void {
    if (this.displayTimer) { clearTimeout(this.displayTimer); this.displayTimer = null; }
    this.clientInfo = null;
    this.membershipInfo = null;
    this.lastVisit = null;
    this.pinMode = false;
    this.pinInput = '';
    this.cdr.detectChanges();
    this.startScanner();
  }

  stopCamera(): void {
    this.stopScanner();
  }

  isMembershipActive(endDate: string | undefined | null): boolean {
    if (!endDate) return false;
    return new Date(endDate) >= new Date();
  }

  togglePinMode(): void {
    this.pinMode = !this.pinMode;
    if (this.pinMode) {
      this.pinInput = '';
      this.stopScanner();
    } else {
      this.startScanner();
    }
  }

  onPinInput(): void {
    this.pinInput = this.pinInput.replace(/[^0-9]/g, '').slice(0, 6);
    if (this.pinInput.length === 6) {
      this.checkInPin();
    }
  }

  checkInPin(): void {
    if (!this.pinInput || this.pinInput.length !== 6) return;

    this.state = 'verifying';
    this.message = 'Verificando PIN...';
    this.cdr.detectChanges();

    this.attendanceService.pinCheckIn(this.pinInput).subscribe({
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
            this.displayTimer = setTimeout(() => this.afterResult(), 4000);
          },
          error: () => {
            this.state = 'denied';
            this.message = 'Error al obtener datos.';
            this.cdr.detectChanges();
            this.displayTimer = setTimeout(() => this.afterResult(), 3000);
          }
        });
      },
      error: (err) => {
        this.state = 'denied';
        this.message = err.error?.detail || 'PIN inválido o expirado.';
        this.cdr.detectChanges();
        this.displayTimer = setTimeout(() => this.afterResult(), 3000);
      }
    });
  }
}
