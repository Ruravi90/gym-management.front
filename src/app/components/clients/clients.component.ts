import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Client } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5; // Show 5 items per page on mobile
  totalPages: number = 0;
  paginatedClients: Client[] = [];

  // Unified Modal State: Registro / Edición
  showClientModal = false;
  editingClient: Client | null = null;
  clientForm = {
    name: '',
    email: '',
    phone: '',
    membership_type: 'basic',
    status: true as boolean
  };

  // Delete Confirmation State
  showDeleteConfirm = false;
  deletingClient: Client | null = null;

  // Face Registration Modal State
  showFaceScanModal = false;
  scanningClient: Client | null = null;
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;
  streaming = false;
  stream: MediaStream | null = null;
  isRegistering = false;
  registrationMessage = '';
  registrationSuccess = false;

  // Camera Selection
  cameraOptions: MediaDeviceInfo[] = [];
  selectedCameraId: string | null = null;
  currentFacingMode: 'user' | 'environment' = 'environment'; // Default to rear camera

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    this.loadClients();
    await this.loadCameraDevices();
  }

  ngOnDestroy(): void {
    this.stopCamera();
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
    this.stopCamera();
    await this.startCamera();
  }

  loadClients() {
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
      this.applyFilter(); // This will also call calculatePagination()
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchTerm) {
      // Usar slice en lugar de spread para mayor compatibilidad
      this.filteredClients = this.clients.slice();
    } else {
      // Usar bucle for en lugar de filter para mayor compatibilidad
      this.filteredClients = [];
      for (let i = 0; i < this.clients.length; i++) {
        const client = this.clients[i];
        if (client.name.toLowerCase().indexOf(this.searchTerm) !== -1 ||
            client.email.toLowerCase().indexOf(this.searchTerm) !== -1) {
          this.filteredClients.push(client);
        }
      }
    }

    // Reset to first page when filtering
    this.currentPage = 1;
    this.calculatePagination();
  }

  getClientMembershipType(client: Client): string {
    return client.membership_type || 'basic';
  }

  // --- Client Modal Controls ---
  openRegisterModal() {
    this.editingClient = null;
    this.resetForm();
    this.showClientModal = true;
  }

  openEditModal(client: Client) {
    // Usar Object.assign en lugar de spread para mayor compatibilidad
    this.editingClient = Object.assign({}, client);
    this.clientForm = {
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      membership_type: client.membership_type,
      status: client.status
    };
    this.showClientModal = true;
  }

  closeClientModal() {
    this.showClientModal = false;
    this.editingClient = null;
    this.resetForm();
  }

  saveClient() {
    if (this.editingClient) {
      this.updateClient();
    } else {
      this.registerClient();
    }
  }

  registerClient() {

    this.clientService.createClient(this.clientForm).subscribe({
      next: (res) => {
        alert('Cliente registrado exitosamente');
        this.closeClientModal();
        this.loadClients();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        alert('Error al registrar cliente: ' + errorMessage);
      }
    });
  }

  updateClient() {
    if (!this.editingClient) return;

    this.clientService.updateClient(this.editingClient.id, this.clientForm).subscribe({
      next: (res) => {
        alert('Cliente actualizado exitosamente');
        this.closeClientModal();
        this.loadClients();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        alert('Error actualizando cliente: ' + errorMessage);
      }
    });
  }

  resetForm() {
    this.clientForm = {
      name: '',
      email: '',
      phone: '',
      membership_type: 'basic',
      status: true
    };
  }

  // --- Face Scan Controls ---
  openFaceScanModal(client: Client) {
    this.scanningClient = client;
    this.showFaceScanModal = true;
    setTimeout(() => {
      this.startCamera();
    }, 100);
  }

  closeFaceScanModal() {
    this.showFaceScanModal = false;
    this.scanningClient = null;
    this.isRegistering = false;
    this.registrationMessage = '';
    this.registrationSuccess = false;
    this.stopCamera();
    
    // Trigger change detection to update the UI
    this.cdr.detectChanges();
  }

  async startCamera() {
    try {
      const constraints = {
        video: {
          aspectRatio: { ideal: 1.333333 }, // 4:3
          facingMode: this.currentFacingMode
        }
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.streaming = true;
      }
    } catch (error) {
      console.error('Error accessing camera', error);
      alert('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.streaming = false;
    }
  }

  captureFace() {
    if (!this.scanningClient || !this.streaming || this.isRegistering) {
      return;
    }

    this.isRegistering = true;
    this.registrationMessage = 'Analizando biometría...';

    const video = this.videoElement.nativeElement;
    
    // --- CROP LOGIC (WYSIWYG) ---
    // Same logic as check-in to ensure registration matches checks
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = 4/3;
    
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;
    let sourceX = 0;
    let sourceY = 0;
    
    if (videoRatio > targetRatio) {
      sourceWidth = sourceHeight * targetRatio;
      sourceX = (video.videoWidth - sourceWidth) / 2;
    } else {
      sourceHeight = sourceWidth / targetRatio;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
    }

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) {
        this.isRegistering = false;
        this.registrationMessage = 'Error capturando imagen';
        return;
      }

      const file = new File([blob], 'face_capture.jpg', { type: 'image/jpeg' });
      this.clientService.registerFace(this.scanningClient!.id, file).subscribe({
        next: (res) => {
          console.log('Registration response:', res); // Debug log
          this.registrationSuccess = true;
          this.registrationMessage = '¡Registro Exitoso!';
          this.isRegistering = false; // Stop the processing state
          
          // Trigger change detection to update the UI
          this.cdr.detectChanges();

          // Automatic close after 1.5s
          setTimeout(() => {
            console.log('Closing modal after success'); // Debug log
            this.closeFaceScanModal();
          }, 1500);
        },
        error: (err) => {
          console.error('Registration error:', err); // Debug log
          this.isRegistering = false;
          this.registrationSuccess = false; // Ensure success state is false for errors
          // Capture the specific error from backend (low confidence, etc)
          // Usar sintaxis compatible en lugar de encadenamiento opcional
          const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
          this.registrationMessage = errorMessage || 'Error desconocido';
          
          // Trigger change detection to update the UI
          this.cdr.detectChanges();
        }
      });
    }, 'image/jpeg');
  }

  // --- Delete Controls ---
  confirmDelete(client: Client) {
    this.deletingClient = client;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirm = false;
    this.deletingClient = null;
  }

  deleteClient() {
    if (!this.deletingClient) return;

    this.clientService.deleteClient(this.deletingClient.id).subscribe({
      next: (res) => {
        alert('Cliente eliminado exitosamente');
        this.closeDeleteConfirmation();
        this.loadClients();
      },
      error: (err) => {
        console.error(err);
        // Usar sintaxis compatible en lugar de encadenamiento opcional
        const errorMessage = err.error && err.error.detail ? err.error.detail : err.message;
        alert('Error eliminando cliente: ' + errorMessage);
      }
    });
  }

  // Pagination methods
  calculatePagination() {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);

    // Calculate start and end index for current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Slice the filtered clients for current page
    this.paginatedClients = this.filteredClients.slice(startIndex, endIndex);
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

  // Navigation methods for membership actions
  navigateToAddMembership(clientId: number) {
    // Navigate directly to the client membership history page which now includes membership creation
    this.router.navigate(['/client-membership-history', clientId]);
  }

  navigateToMembershipHistory(clientId: number) {
    // Navigate to the client membership history page
    this.router.navigate(['/client-membership-history', clientId]);
  }
}
