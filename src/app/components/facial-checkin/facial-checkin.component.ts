import { Component, ElementRef, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { ClientService } from '../../services/client.service';
import { MembershipService } from '../../services/membership.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Facial Check-in Flow States:
 * IDLE: Default wait state (white card, camera off)
 * SCANNING: Camera active, searching for faces
 * VERIFYING: Face detected, awaiting backend response
 * GRANTED: Membership valid (green card, 5s display)
 * DENIED: Membership invalid or face not recognized (orange card, 5s display)
 */
type CheckinState = 'idle' | 'scanning' | 'verifying' | 'granted' | 'denied';

@Component({
  selector: 'app-facial-checkin',
  templateUrl: './facial-checkin.component.html',
  styleUrls: ['./facial-checkin.component.css']
})
export class FacialCheckinComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  // System State
  state: CheckinState = 'idle';
  streaming = false;
  isProcessing = false;
  message = '';

  // Data
  clientInfo: any = null;
  membershipInfo: any = null;
  lastVisit: any = null;

  // Resources
  private stream: MediaStream | null = null;
  private scanInterval: any = null;
  private displayTimer: any = null;

  // Camera Selection
  cameraOptions: MediaDeviceInfo[] = [];
  selectedCameraId: string | null = null;
  currentFacingMode: 'user' | 'environment' = 'environment'; // Default to rear camera

  // Manual Mode
  manualMode = false;
  searchTerm = '';
  clients: any[] = [];
  manualClientId: number | null = null;
  retryCount = 0;

  constructor(
    private attendanceService: AttendanceService,
    private clientService: ClientService,
    private membershipService: MembershipService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCameraDevices();
  }

  ngOnDestroy(): void {
    this.resetToIdle();
  }

  // Load available camera devices
  async loadCameraDevices(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameraOptions = devices.filter(device => device.kind === 'videoinput');
      console.log('Available cameras:', this.cameraOptions);
    } catch (error) {
      console.error('Error enumerating camera devices:', error);
    }
  }

  // Toggle between front and rear cameras
  async toggleCamera(): Promise<void> {
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    if (this.streaming) {
      await this.restartCamera();
    }
  }

  // Restart camera with new facing mode
  private async restartCamera(): Promise<void> {
    this.stopCameraTracks();
    await this.startCamera();
  }

  // --- STEP 1: Activar Cámara ---
  async startCamera() {
    if (this.streaming) return;

    console.log('Starting camera...');
    try {
      // Solicitar 4:3 aspect ratio y especificar cámara frontal o trasera
      const constraints = {
        video: {
          aspectRatio: { ideal: 1.333333 }, // 4:3
          facingMode: this.currentFacingMode
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Update state FIRST so *ngIf renders the video element in the DOM
      this.streaming = true;
      this.state = 'scanning';
      this.message = 'Centra tu rostro en la guía';
      this.cdr.detectChanges();

      // Now nativeElement is guaranteed to be defined
      this.videoElement.nativeElement.srcObject = this.stream;
      this.startScanning();
    } catch (error) {
      console.error('Camera access error:', error);
      this.message = 'Error al acceder a la cámara';
      this.state = 'denied';
      this.displayTimer = setTimeout(() => this.resetToIdle(), 3000);
      this.cdr.detectChanges();
    }
  }

  // --- STEP 2: Validar Acceso ---
  private startScanning() {
    if (this.scanInterval) return;
    this.scanInterval = setInterval(() => {
      if (!this.isProcessing && this.streaming) {
        this.captureAndCheckIn();
      }
    }, 3000);
  }

  captureAndCheckIn() {
    if (this.isProcessing || !this.streaming) return;
    
    this.isProcessing = true;
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    if (!video.videoWidth) {
      this.isProcessing = false;
      return;
    }

    // --- CROP LOGIC (WYSIWYG) ---
    // Calculate the source dimensions to crop from the center of the video
    // that match a 4:3 aspect ratio (which is what the UI shows)
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = 4/3;
    
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;
    let sourceX = 0;
    let sourceY = 0;
    
    // If video is wider than target, crop width
    if (videoRatio > targetRatio) {
      sourceWidth = sourceHeight * targetRatio;
      sourceX = (video.videoWidth - sourceWidth) / 2;
    } 
    // If video is taller than target, crop height
    else {
      sourceHeight = sourceWidth / targetRatio;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    // Set canvas to a standard resolution (e.g. 640x480) or the cropped size
    canvas.width = 640;
    canvas.height = 480;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Draw only the cropped area to the canvas
    context.drawImage(
      video, 
      sourceX, sourceY, sourceWidth, sourceHeight, // Source crop
      0, 0, canvas.width, canvas.height        // Destination (full canvas)
    );

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) {
        this.isProcessing = false;
        return;
      }

      console.log('Image captured, verifying...');
      this.state = 'verifying';
      this.message = 'Verificando rostro...';
      this.cdr.detectChanges();

      this.attendanceService.checkIn(blob).subscribe({
        next: (res) => {
          console.log('Check-in success, fetching member details:', res.client_id);
          this.retryCount = 0; // Reset retries on successful recognition
          
          // --- STEP 3: Detener Validación inmediatamente ---
          this.stopScanning();
          
          // Fetch client and membership in parallel
          forkJoin({
            client: this.clientService.getClient(res.client_id).pipe(catchError(() => of(null))),
            membership: this.membershipService.getActiveMembershipByClient(res.client_id).pipe(catchError(() => of(null))),
            history: this.attendanceService.getAttendanceHistory(res.client_id).pipe(catchError(() => of([])))
          }).subscribe({
            next: (data) => {
              console.log('Member data received:', data);
              this.clientInfo = data.client;
              this.membershipInfo = data.membership;
              
              if (data.history && data.history.length > 0) {
                this.lastVisit = [...data.history].sort((a: any, b: any) => 
                  new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
                )[0];
              }

              const hasAccess = this.isMembershipActive(data.membership?.end_date);
              
              // --- STEP 4: Mostrar Mensaje y Colores y Detener Cámara ---
              this.stopCameraTracks(); // Stop stream immediately to hide camera column

              if (hasAccess) {
                this.state = 'granted';
                this.message = `¡Acceso Concedido!`;
              } else {
                this.state = 'denied';
                this.message = 'Acceso Denegado: Membresía no activa o vencida.';
              }

              this.cdr.detectChanges();

              // --- STEP 5: Restaurar Componentes después de 5s ---
              if (this.displayTimer) clearTimeout(this.displayTimer);
              this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
            },
            error: (err) => {
              console.error('Error fetching member details:', err);
              this.stopCameraTracks();
              this.state = 'denied';
              this.message = 'Error al recuperar información.';
              this.cdr.detectChanges();
              this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
            }
          });
        },
        error: (err) => {
          console.error('Check-in authentication error:', err);
          this.retryCount++;
          this.isProcessing = false; // Allow next interval to try again

          if (this.retryCount < 5) {
            // Keep scanning, just update the message
            this.state = 'scanning';
            this.message = `Rostro no reconocido. Reintentando (${this.retryCount}/5)...`;
            this.cdr.detectChanges();
          } else {
            // Max retries reached, show denied state
            this.stopScanning();
            this.stopCameraTracks(); 
            this.state = 'denied';
            this.message = 'Rostro no reconocido tras 5 intentos. Por favor, intenta de nuevo o solicita ayuda.';
            this.cdr.detectChanges();
            
            this.displayTimer = setTimeout(() => {
              this.resetToIdle(); 
            }, 5000);
          }
        }
      });
    }, 'image/jpeg');
  }

  // --- Logic Helpers ---

  private stopScanning() {
    if (this.scanInterval) {
      console.log('Stopping scanner interval');
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  private stopCameraTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.streaming = false;
  }

  resetToIdle() {
    console.log('Resetting to idle state');
    this.stopScanning();
    if (this.displayTimer) {
      clearTimeout(this.displayTimer);
      this.displayTimer = null;
    }
    this.stopCameraTracks();
    
    this.isProcessing = false;
    this.retryCount = 0; // Reset retries on full reset
    this.state = 'idle';
    this.message = '';
    this.clientInfo = null;
    this.membershipInfo = null;
    this.lastVisit = null;
    this.cdr.detectChanges();
  }

  stopCamera() {
    this.resetToIdle();
  }

  isMembershipActive(endDate: string | undefined | null): boolean {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    return end >= now;
  }

  // --- Manual Mode --- (Keeping existing functionality)
  toggleManualMode() {
    this.manualMode = !this.manualMode;
    if (this.manualMode) {
      this.searchTerm = '';
      this.clients = [];
      this.loadClients();
    }
  }

  loadClients() {
    this.clientService.getClients().subscribe(data => this.clients = data);
  }

  searchClients() {
    if (this.searchTerm.trim()) {
      this.clientService.searchClients(this.searchTerm).subscribe(data => this.clients = data);
    } else {
      this.loadClients();
    }
  }

  checkInManual() {
    console.log('Manual check-in initiated, client ID:', this.manualClientId); // Debug log
    if (!this.manualClientId) {
      console.log('No client selected'); // Debug log
      return;
    }

    this.message = 'Procesando ingreso manual...';
    this.state = 'verifying';
    this.cdr.detectChanges();

    this.attendanceService.checkInManual(this.manualClientId).subscribe({
      next: (res) => {
        console.log('Manual check-in success, response:', res); // Debug log
        console.log('Manual check-in success, fetching member details:', res.client_id);

        // Fetch client and membership in parallel (same logic as automatic)
        forkJoin({
          client: this.clientService.getClient(res.client_id).pipe(catchError(() => of(null))),
          membership: this.membershipService.getActiveMembershipByClient(res.client_id).pipe(catchError(() => of(null))),
          history: this.attendanceService.getAttendanceHistory(res.client_id).pipe(catchError(() => of([])))
        }).subscribe({
          next: (data) => {
            console.log('Member data fetched:', data); // Debug log
            this.clientInfo = data.client;
            this.membershipInfo = data.membership;

            if (data.history && data.history.length > 0) {
              this.lastVisit = [...data.history].sort((a: any, b: any) =>
                new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
              )[0];
            }

            const hasAccess = this.isMembershipActive(data.membership?.end_date);

            this.state = hasAccess ? 'granted' : 'denied';
            this.message = hasAccess ? '¡Acceso Concedido!' : 'Acceso Denegado: Membresía no activa.';
            this.manualMode = false; // Close modal

            this.cdr.detectChanges();

            if (this.displayTimer) clearTimeout(this.displayTimer);
            this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
          },
          error: (err) => {
            console.error('Error fetching member details:', err);
            this.state = 'denied';
            this.message = 'Error al recuperar información.';
            this.manualMode = false;
            this.cdr.detectChanges();
            this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
          }
        });
      },
      error: (err) => {
        console.error('Manual check-in error:', err);
        console.error('Error details:', err.message, err.status); // Additional debug
        this.state = 'denied';
        this.message = 'Error al registrar ingreso manual.';
        this.manualMode = false;
        this.cdr.detectChanges();
        this.displayTimer = setTimeout(() => this.resetToIdle(), 5000);
      }
    });
  }

  triggerEmergency() {
    alert('MODO EMERGENCIA ACTIVADO: TODAS LAS PUERTAS ABIERTAS');
    this.message = '⚠️ EMERGENCIA: PUERTAS ABIERTAS ⚠️';
    this.cdr.detectChanges();
  }
}
